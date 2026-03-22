import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card } from "../components";
import { COLORS } from "../constants";
import { parkingService } from "../services/parkingService";

export default function SlotDetailScreen({ route, navigation }) {
  const {
    zoneId,
    slotId,
    zoneName: initialZoneName,
    pricePerHour: initialPrice,
  } = route.params || {};
  const [zone, setZone] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, [zoneId, slotId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const [zoneResult, slotResult] = await Promise.all([
        parkingService.getParkingZoneById(zoneId),
        parkingService.getSlotById(zoneId, slotId),
      ]);
      if (zoneResult?.success) setZone(zoneResult.zone);
      if (slotResult?.success) setSlot(slotResult.slot);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el detalle del cupo.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) =>
    ({ available: "Disponible", occupied: "Ocupado", reserved: "Reservado" })[
      status
    ] || status;
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return COLORS.success;
      case "occupied":
        return COLORS.danger;
      case "reserved":
        return COLORS.warning;
      default:
        return COLORS.gray;
    }
  };
  const getTypeLabel = (type) =>
    ({
      regular: "Regular",
      handicapped: "Discapacidad",
      motorcycle: "Motocicleta",
      electric: "Eléctrico",
      compact: "Compacto",
    })[type?.toLowerCase()] ||
    type ||
    "Regular";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  const displayPrice = zone?.pricePerHour ?? initialPrice ?? 0;
  const displayZoneName = zone?.name ?? initialZoneName ?? "Zona";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ubicación</Text>
        <Text style={styles.zoneName}>{displayZoneName}</Text>
        {zone?.address ? (
          <Text style={styles.infoValue}>{zone.address}</Text>
        ) : null}
        {zone?.description ? (
          <Text style={styles.description}>{zone.description}</Text>
        ) : null}
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{zone?.availableSlots ?? "—"}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{zone?.totalSlots ?? "—"}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Detalle del Cupo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Número:</Text>
          <Text style={styles.value}>Cupo {slot?.slotNumber ?? "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{getTypeLabel(slot?.type)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(slot?.status) },
            ]}
          >
            <Text style={styles.badgeText}>{getStatusLabel(slot?.status)}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Reglas y Tarifas</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Precio por hora:</Text>
          <Text style={styles.value}>
            ${displayPrice.toLocaleString()} / hora
          </Text>
        </View>
        {zone?.maxHours ? (
          <View style={styles.row}>
            <Text style={styles.label}>Máximo de horas:</Text>
            <Text style={styles.value}>{zone.maxHours} horas</Text>
          </View>
        ) : null}
        {zone?.rules ? (
          <View style={styles.rulesBlock}>
            <Text style={styles.label}>Restricciones:</Text>
            <Text style={styles.rulesText}>{zone.rules}</Text>
          </View>
        ) : (
          <Text style={styles.noRulesText}>
            No hay restricciones especiales para esta zona.
          </Text>
        )}
      </Card>

      <View style={styles.actionContainer}>
        {slot?.status === "available" ? (
          <Button
            title="Reservar este cupo"
            variant="primary"
            onPress={() =>
              navigation.navigate("ReservationBooking", {
                zoneId,
                slotId,
                slotNumber: slot?.slotNumber,
                zoneName: displayZoneName,
                price: displayPrice,
              })
            }
          />
        ) : (
          <View style={styles.unavailableBox}>
            <Text style={styles.unavailableText}>
              Este cupo no está disponible para reserva en este momento.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: COLORS.gray, fontSize: 14 },
  card: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: 4,
  },
  infoValue: { fontSize: 14, color: COLORS.gray, marginBottom: 8 },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  statBlock: { alignItems: "center" },
  statNumber: { fontSize: 22, fontWeight: "700", color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  label: { fontSize: 14, color: COLORS.gray, minWidth: 130 },
  value: { fontSize: 14, fontWeight: "600", color: COLORS.dark, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  rulesBlock: { marginTop: 4 },
  rulesText: { fontSize: 14, color: COLORS.dark, marginTop: 4, lineHeight: 20 },
  noRulesText: { fontSize: 14, color: COLORS.gray, fontStyle: "italic" },
  actionContainer: { marginTop: 8 },
  unavailableBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  unavailableText: { color: COLORS.gray, fontSize: 14, textAlign: "center" },
});
