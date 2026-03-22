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
import { Button, Card } from "../components";
import { COLORS } from "../constants";
import { useParking } from "../hooks";

export default function ParkingSlotsScreen({ route, navigation }) {
  const { zoneId, zoneName, pricePerHour } = route.params;
  const { selectedSlots: slots, isLoading, fetchSlots } = useParking();

  useEffect(() => {
    fetchSlots(zoneId);
  }, [zoneId]);

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
    >
      <Card>
        <View style={styles.slotContent}>
          <View style={styles.slotInfo}>
            <Text style={styles.slotNumber}>Cupo {item.slotNumber}</Text>
            <Text style={styles.slotType}>{item.type}</Text>
          </View>
          <View
            style={[
              styles.slotStatus,
              { backgroundColor: getSlotColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {{
                available: "Disponible",
                occupied: "Ocupado",
                reserved: "Reservado",
              }[item.status] || item.status}
            </Text>
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
      <FlatList
        data={slots}
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
});
