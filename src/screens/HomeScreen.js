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
import { useParking, useReservation, useTheme } from "../hooks";
import { getTimeago } from "../utils";

export default function HomeScreen({ navigation }) {
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, colors } = useTheme();
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

  const StatCard = ({ label, value, color = colors.primary }) => (
    <View
      style={[
        styles.statCard,
        { borderLeftColor: color, backgroundColor: colors.white },
      ]}
    >
      <Text style={[styles.statLabel, { color: colors.gray }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hola, {user?.nombre || user?.firstName || "Usuario"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.gray }]}>
            Bienvenido a Smart Parking
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            label="Zonas"
            value={zones.length.toString()}
            color={colors.primary}
          />
          <StatCard
            label="Reservas"
            value={reservations
              .filter((r) => r.status === "active")
              .length.toString()}
            color={colors.secondary}
          />
          <StatCard
            label="Completadas"
            value={reservations
              .filter((r) => r.status === "completed")
              .length.toString()}
            color={colors.success}
          />
        </View>

        <View
          style={[styles.actionsContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.dark }]}>
            Acciones Rápidas
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate("Parking", { screen: "ParkingZones" })
            }
          >
            <Text style={styles.actionButtonText}>Buscar Estacionamiento</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryAction,
              { backgroundColor: colors.white, borderColor: colors.lightGray },
            ]}
            onPress={() => navigation.navigate("Reservations")}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.secondaryActionText,
                { color: colors.primary },
              ]}
            >
              Mis Reservas
            </Text>
          </TouchableOpacity>
        </View>

        {reservations.length > 0 && (
          <View
            style={[
              styles.recentContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.dark }]}>
              Reservas Recientes
            </Text>
            {reservations.slice(0, 3).map((reservation) => (
              <Card key={reservation.id} colors={colors}>
                <Text style={[styles.reservationZone, { color: colors.dark }]}>
                  {reservation.zoneName || `Zona ${reservation.zoneId}`}
                </Text>
                <Text
                  style={[styles.reservationStatus, { color: colors.gray }]}
                >
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
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
  },
  greeting: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  statLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700" },
  actionsContainer: { paddingHorizontal: 16, marginVertical: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#00B992",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryAction: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  secondaryActionText: { color: "#00B992" },
  recentContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  reservationZone: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  reservationStatus: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textTransform: "capitalize",
  },
});
