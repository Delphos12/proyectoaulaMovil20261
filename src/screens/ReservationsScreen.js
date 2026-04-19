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
import { useSelector } from "react-redux";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    SearchBar,
    SegmentedButtons,
} from "../components";
import { COLORS } from "../constants";
import { useReservation } from "../hooks";
import {
    formatCurrency,
    formatDate,
    formatTime,
    getDurationHours,
} from "../utils";

export default function ReservationsScreen({ navigation }) {
  const { reservations, isLoading, fetchReservations } = useReservation();
  const { user } = useSelector((state) => state.auth);
  const [filterTab, setFilterTab] = useState("activas");
  const [searchZone, setSearchZone] = useState("");

  useEffect(() => {
    if (user?.uid) fetchReservations(user.uid);
  }, [user?.uid]);

  const onRefresh = () => {
    if (user?.uid) fetchReservations(user.uid);
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    if (filterTab === "activas") {
      filtered = filtered.filter((r) =>
        ["reserved", "in_use"].includes(r.status),
      );
    } else if (filterTab === "historicas") {
      filtered = filtered.filter((r) =>
        ["completed", "cancelled"].includes(r.status),
      );
    }

    if (searchZone) {
      filtered = filtered.filter((r) =>
        (r.zoneName || "").toLowerCase().includes(searchZone.toLowerCase()),
      );
    }

    return filtered;
  }, [reservations, filterTab, searchZone]);

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
      active: "Activa",
      expired: "Expirada",
    })[status] || status;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ReservationDetail", { reservationId: item.id })
      }
    >
      <Card>
        <CardHeader
          title={
            item.zoneName
              ? `${item.zoneName} - Cupo ${item.slotNumber}`
              : `Zona ${item.zoneId} - Cupo ${item.slotId}`
          }
          subtitle={formatDate(item.startTime)}
        />
        <CardBody>
          <View style={styles.reservationInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora Inicio</Text>
              <Text style={styles.infoValue}>{formatTime(item.startTime)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora Fin</Text>
              <Text style={styles.infoValue}>{formatTime(item.endTime)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>
                {Math.round(getDurationHours(item.startTime, item.endTime))}{" "}
                horas
              </Text>
            </View>
            {item.vehicleType ? (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Vehículo</Text>
                <Text style={styles.infoValue}>
                  {item.vehicleType.charAt(0).toUpperCase() +
                    item.vehicleType.slice(1)}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            {formatCurrency(item.price || 0)}
          </Text>
        </CardBody>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SegmentedButtons
        options={[
          { label: "Activas", value: "activas" },
          { label: "Históricas", value: "historicas" },
          { label: "Todas", value: "todas" },
        ]}
        value={filterTab}
        onChange={setFilterTab}
      />
      <SearchBar
        placeholder="Buscar por zona..."
        value={searchZone}
        onChangeText={setSearchZone}
      />
      <FlatList
        data={filteredReservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filterTab === "activas"
                ? "No tienes reservas activas"
                : filterTab === "historicas"
                  ? "No tienes reservas completadas o canceladas"
                  : "No tienes reservas"}
            </Text>
            {filterTab === "activas" && (
              <Button
                title="Hacer una Reserva"
                onPress={() =>
                  navigation.navigate("Parking", { screen: "ParkingZones" })
                }
                variant="primary"
              />
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  listContent: { padding: 12, paddingBottom: 32 },
  reservationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.gray },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginTop: 2,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: { color: COLORS.gray, fontSize: 16, marginBottom: 16 },
});
