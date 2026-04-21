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
import { Card, CardBody, CardHeader, LoadingSpinner } from "../components";
import { COLORS } from "../constants";
import { useParking } from "../hooks";

export default function ParkingZonesScreen({ navigation }) {
  const { zones, isLoading, fetchZones } = useParking();

  useEffect(() => {
    fetchZones();
  }, []);

  const renderZoneItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ParkingSlots", {
          zoneId: item.id,
          zoneName: item.name,
          pricePerHour: item.pricePerHour || 0,
        })
      }
    >
      <Card>
        <CardHeader title={item.name} subtitle={item.address} />
        <CardBody>
          <View style={styles.zoneStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.availableSlots || 0}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.totalSlots || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.pricePerHour || 0}</Text>
              <Text style={styles.statLabel}>$/hora</Text>
            </View>
          </View>
        </CardBody>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && zones.length === 0) {
    return <LoadingSpinner visible message="Cargando zonas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={zones}
        renderItem={renderZoneItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchZones()}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay zonas disponibles</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  listContent: { padding: 12, paddingBottom: 32 },
  zoneStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyText: { color: COLORS.gray, fontSize: 16 },
});
