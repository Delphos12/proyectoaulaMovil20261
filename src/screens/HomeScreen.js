import { useEffect } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Card } from "../components";
import { COLORS } from "../constants";
import { useParking, useReservation } from "../hooks";
import { getTimeago } from "../utils";

export default function HomeScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);
  const { zones, isLoading: zonesLoading, fetchZones } = useParking();
  const {
    reservations,
    isLoading: resLoading,
    fetchReservations,
  } = useReservation();
  const refreshing = zonesLoading || resLoading;

  useEffect(() => {
    fetchZones();
    if (user?.uid) fetchReservations(user.uid);
  }, [user?.uid]);

  const onRefresh = () => {
    fetchZones();
    if (user?.uid) fetchReservations(user.uid);
  };

  const StatCard = ({ label, value, color = COLORS.primary }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hola, {user?.nombre || user?.firstName || "Usuario"}
          </Text>
          <Text style={styles.subtitle}>Bienvenido a Smart Parking</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            label="Zonas"
            value={zones.length.toString()}
            color={COLORS.primary}
          />
          <StatCard
            label="Reservas"
            value={reservations
              .filter((r) => r.status === "active")
              .length.toString()}
            color={COLORS.secondary}
          />
          <StatCard
            label="Completadas"
            value={reservations
              .filter((r) => r.status === "completed")
              .length.toString()}
            color={COLORS.success}
          />
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("Parking", { screen: "ParkingZones" })
            }
          >
            <Text style={styles.actionButtonText}>Buscar Estacionamiento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => navigation.navigate("Reservations")}
          >
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              Mis Reservas
            </Text>
          </TouchableOpacity>
        </View>

        {reservations.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Reservas Recientes</Text>
            {reservations.slice(0, 3).map((reservation) => (
              <Card key={reservation.id}>
                <Text style={styles.reservationZone}>
                  {reservation.zoneName || `Zona ${reservation.zoneId}`}
                </Text>
                <Text style={styles.reservationStatus}>
                  {{
                    active: "Activa",
                    completed: "Completada",
                    cancelled: "Cancelada",
                    expired: "Expirada",
                  }[reservation.status] || reservation.status}
                  {reservation.createdAt
                    ? ` · ${getTimeago(reservation.createdAt)}`
                    : ""}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.white,
  },
  greeting: { fontSize: 24, fontWeight: "700", color: COLORS.dark },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 4 },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  statLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700" },
  actionsContainer: { paddingHorizontal: 16, marginVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryAction: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  secondaryActionText: { color: COLORS.primary },
  recentContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  reservationZone: { fontSize: 14, fontWeight: "600", color: COLORS.dark },
  reservationStatus: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textTransform: "capitalize",
  },
});
