import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Button, Card, CardBody, CardHeader } from "../components";
import { COLORS } from "../constants";
import { useReservation } from "../hooks";
import { reservationService } from "../services/reservationService";
import { formatCurrency, formatDateTime, getDurationHours } from "../utils";

export default function ReservationDetailScreen({ route, navigation }) {
  const { reservationId } = route.params || {};
  const { user } = useSelector((state) => state.auth);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: isCancelling, cancelReservation } = useReservation();

  useEffect(() => {
    loadDetail();
  }, [reservationId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const result = await reservationService.getReservationById(reservationId);
      if (result.success) setReservation(result.reservation);
      else Alert.alert("Error", result.error || "Error al cargar la reserva");
    } catch (error) {
      Alert.alert("Error", error.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("¿Cancelar reserva?", "Esta acción no se puede deshacer", [
      { text: "No" },
      {
        text: "Sí, cancelar",
        onPress: () => {
          cancelReservation(
            reservationId,
            reservation?.slotId,
            reservation?.zoneId,
            user?.uid,
          );
          Alert.alert("Éxito", "Reserva cancelada", [
            { text: "Aceptar", onPress: () => navigation.goBack() },
          ]);
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return COLORS.success;
      case "completed":
        return COLORS.primary;
      case "cancelled":
        return COLORS.danger;
      case "expired":
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };
  const getStatusLabel = (status) =>
    ({
      active: "Activa",
      completed: "Completada",
      cancelled: "Cancelada",
      expired: "Expirada",
    })[status] || status;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Reserva no encontrada</Text>
        <Button
          title="Volver"
          variant="primary"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const duration = getDurationHours(reservation.startTime, reservation.endTime);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader
          title={reservation.zoneName || `Zona ${reservation.zoneId}`}
          subtitle={`Cupo ${reservation.slotNumber || reservation.slotId}`}
        />
        <CardBody>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Estado:</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(reservation.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(reservation.status)}
              </Text>
            </View>
          </View>
        </CardBody>
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Fecha y Hora" />
        <CardBody>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Inicio:</Text>
            <Text style={styles.value}>
              {formatDateTime(reservation.startTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Fin:</Text>
            <Text style={styles.value}>
              {formatDateTime(reservation.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Duración:</Text>
            <Text style={styles.value}>{duration.toFixed(1)} horas</Text>
          </View>
        </CardBody>
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Precio" />
        <CardBody>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total:</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(reservation.price)}
            </Text>
          </View>
        </CardBody>
      </Card>

      {reservation.notes ? (
        <Card style={styles.card}>
          <CardHeader title="Notas" />
          <CardBody>
            <Text style={styles.notes}>{reservation.notes}</Text>
          </CardBody>
        </Card>
      ) : null}

      <View style={styles.buttonContainer}>
        {reservation.status === "active" ? (
          <>
            <Button
              title="Volver"
              variant="secondary"
              onPress={() => navigation.goBack()}
              size="large"
            />
            <Button
              title="Cancelar Reserva"
              variant="danger"
              onPress={handleCancel}
              loading={isCancelling}
              size="large"
            />
          </>
        ) : (
          <Button
            title="Volver"
            variant="primary"
            onPress={() => navigation.goBack()}
            size="large"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  card: { marginBottom: 16 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: { fontSize: 14, color: COLORS.darkGray, fontWeight: "500" },
  value: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  priceLabel: { fontSize: 16, color: COLORS.text, fontWeight: "600" },
  priceValue: { fontSize: 18, color: COLORS.primary, fontWeight: "700" },
  notes: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  buttonContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  errorText: { fontSize: 16, color: COLORS.danger, marginBottom: 16 },
});
