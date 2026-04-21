import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Card, SegmentedButtons } from "../components";
import { COLORS } from "../constants";
import { useParking } from "../hooks";

export default function ParkingSlotsScreen({ route, navigation }) {
  const { zoneId, zoneName, pricePerHour } = route.params;
  const { selectedSlots: slots, isLoading, fetchSlots } = useParking();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("todos");

  useEffect(() => {
    fetchSlots(zoneId);
  }, [zoneId]);

  // Mapear tipos de cupo a tipos de vehículo
  const getAcceptedVehicleTypes = (slotType) => {
    switch (slotType?.toLowerCase()) {
      case "motorcycle":
        return ["moto"];
      case "handicapped":
      case "regular":
      case "electric":
        return ["carro"];
      default:
        return ["carro", "moto"];
    }
  };

  const filteredSlots = useMemo(() => {
    let filtered = slots;

    // Filtro 1: Por disponibilidad (Todos/Disponibles/Reservados)
    if (statusFilter === "disponibles")
      filtered = filtered.filter((s) => s.status === "available");
    else if (statusFilter === "reservados")
      filtered = filtered.filter((s) => s.status === "reserved");

    // Filtro 2: Por tipo de vehículo (Todos/Carro/Moto)
    if (vehicleTypeFilter !== "todos") {
      filtered = filtered.filter((s) => {
        const acceptedTypes = getAcceptedVehicleTypes(s.type);
        return acceptedTypes.includes(vehicleTypeFilter);
      });
    }

    return filtered;
  }, [slots, statusFilter, vehicleTypeFilter]);

  const getSlotColor = (status) => {
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

  const getStatusLabel = (status) =>
    ({
      available: "Disponible",
      occupied: "Ocupado",
      reserved: "Reservado",
    })[status] || status;

  const renderSlotItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("SlotDetail", {
          zoneId,
          slotId: item.id,
          zoneName,
          pricePerHour,
        })
      }
      style={styles.slotTouchable}
    >
      <Card style={styles.slotCard}>
        <View style={styles.slotContent}>
          <View style={styles.slotInfo}>
            <Text style={styles.slotNumber}>Cupo {item.slotNumber}</Text>
            <Text style={styles.slotType}>{item.type || "Estándar"}</Text>
          </View>
          <View
            style={[
              styles.slotStatus,
              { backgroundColor: getSlotColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        {item.status === "available" && (
          <Button
            title="Reservar"
            onPress={() =>
              navigation.navigate("ReservationBooking", {
                zoneId,
                slotId: item.id,
                slotNumber: item.slotNumber,
                zoneName,
                price: pricePerHour,
              })
            }
            variant="primary"
            size="small"
          />
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{zoneName}</Text>
      </View>
      <SegmentedButtons
        options={[
          { label: "Todos", value: "todos" },
          { label: "Disponibles", value: "disponibles" },
          { label: "Reservados", value: "reservados" },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />
      <SegmentedButtons
        options={[
          { label: "Todos", value: "todos" },
          { label: "Carro", value: "carro" },
          { label: "Moto", value: "moto" },
        ]}
        value={vehicleTypeFilter}
        onChange={setVehicleTypeFilter}
      />
      <FlatList
        data={filteredSlots}
        renderItem={renderSlotItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchSlots(zoneId)}
          />
        }
        contentContainerStyle={styles.listContent}
        numColumns={2}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay cupos {statusFilter === "todos" ? "" : statusFilter}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.dark },
  listContent: { padding: 8, paddingBottom: 32 },
  slotTouchable: { flex: 1, margin: 4 },
  slotCard: { marginHorizontal: 0, marginVertical: 0 },
  slotContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotInfo: { flex: 1 },
  slotNumber: { fontSize: 16, fontWeight: "700", color: COLORS.dark },
  slotType: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  slotStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: { color: COLORS.gray, fontSize: 16 },
});
