import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const reduxReservations = useSelector(
    (state) => state.reservation.reservations,
  );
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isCancelling, cancelError, cancelReservation } = useReservation();
  const [cancellationAttempted, setCancellationAttempted] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Sincronizar con Redux cuando la reserva se actualiza
  useEffect(() => {
    const reduxReservation = reduxReservations.find(
      (r) => r.id === reservationId,
    );
    if (reduxReservation) {
      setReservation(reduxReservation);
    }
  }, [reduxReservations, reservationId]);

  useEffect(() => {
    loadDetail();
  }, [reservationId]);

  // Monitorear cambios en isCancelling para completar la cancelación
  useEffect(() => {
    if (cancellationAttempted && !isCancelling) {
      setCancellationAttempted(false);
      setShowCancelConfirm(false); // Cerrar Modal ANTES de mostrar Alert

      if (cancelError) {
        Alert.alert(
          "Error al cancelar",
          cancelError || "No se pudo cancelar la reserva",
          [{ text: "Aceptar" }],
        );
      } else {
        Alert.alert("¡Éxito!", "Reserva cancelada correctamente", [
          {
            text: "Aceptar",
            onPress: () => {
              // Solo navegar - Redux ya actualizó la reserva a "cancelled"
              navigation.goBack();
            },
          },
        ]);
      }
    }
  }, [isCancelling, cancellationAttempted, cancelError]);

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
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    setCancellationAttempted(true);
    const result = cancelReservation(
      reservationId,
      reservation?.slotId,
      reservation?.zoneId,
      user?.uid,
    );
  };

  const handleDeclineCancel = () => {
    setShowCancelConfirm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "reserved":
        return COLORS.primary;
      case "in_use":
        return COLORS.success;
      case "completed":
        return COLORS.info;
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
      reserved: "Reservado",
      in_use: "En uso",
      completed: "Finalizado",
      cancelled: "Cancelado",
      expired: "Expirado",
      active: "Activa",
    })[status] || status;

  const canCancelReservation = reservation?.status === "reserved";

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

      {reservation.vehicleType ? (
        <Card style={styles.card}>
          <CardHeader title="Vehículo" />
          <CardBody>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>
                {reservation.vehicleType.charAt(0).toUpperCase() +
                  reservation.vehicleType.slice(1)}
              </Text>
            </View>
          </CardBody>
        </Card>
      ) : null}

      {reservation.notes ? (
        <Card style={styles.card}>
          <CardHeader title="Notas" />
          <CardBody>
            <Text style={styles.notes}>{reservation.notes}</Text>
          </CardBody>
        </Card>
      ) : null}

      <View style={styles.buttonContainer}>
        {canCancelReservation ? (
          <>
            <Button
              title="Volver"
              variant="secondary"
              onPress={() => navigation.goBack()}
              size="large"
            />
            <TouchableOpacity
              style={[
                styles.destructiveButton,
                isCancelling && styles.destructiveButtonDisabled,
              ]}
              onPress={handleCancel}
              disabled={isCancelling}
              activeOpacity={0.8}
            >
              <Text style={styles.destructiveButtonText}>
                 Cancelar Reserva
              </Text>
              {isCancelling && (
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                  style={styles.buttonLoader}
                />
              )}
            </TouchableOpacity>
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

      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleDeclineCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Cancelar reserva?</Text>
            <Text style={styles.modalMessage}>
              Esta acción no se puede deshacer. ¿Estás seguro?
            </Text>

            <View style={styles.modalButtonContainer}>
              <Button
                title="No, mantener"
                variant="secondary"
                onPress={handleDeclineCancel}
                size="large"
              />
              <TouchableOpacity
                style={[
                  styles.destructiveButton,
                  styles.modalDestructiveButton,
                  isCancelling && styles.destructiveButtonDisabled,
                ]}
                onPress={handleConfirmCancel}
                disabled={isCancelling}
                activeOpacity={0.8}
              >
                <Text style={styles.destructiveButtonText}>
                  {isCancelling ? "Cancelando..." : "Sí, cancelar"}
                </Text>
                {isCancelling && (
                  <ActivityIndicator
                    color={COLORS.white}
                    size="small"
                    style={styles.buttonLoader}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: "#C41C3B",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#9D1528",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  destructiveButtonDisabled: {
    opacity: 0.6,
  },
  destructiveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonLoader: {
    marginLeft: 8,
  },
  modalDestructiveButton: {
    flex: 1,
    paddingVertical: 14,
  },
});
