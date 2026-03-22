import { useEffect } from "react";
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
import { Button, Card, CardBody, CardHeader } from "../components";
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

  useEffect(() => {
    if (user?.uid) fetchReservations(user.uid);
  }, [user?.uid]);

  const onRefresh = () => {
    if (user?.uid) fetchReservations(user.uid);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return COLORS.success;
      case "completed":
        return COLORS.info;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

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
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>
                {Math.round(getDurationHours(item.startTime, item.endTime))}{" "}
                horas
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {{
                  active: "Activa",
                  completed: "Completada",
                  cancelled: "Cancelada",
                  expired: "Expirada",
                }[item.status] || item.status}
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
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas</Text>
            <Button
              title="Hacer una Reserva"
              onPress={() =>
                navigation.navigate("Parking", { screen: "ParkingZones" })
              }
              variant="primary"
            />
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
