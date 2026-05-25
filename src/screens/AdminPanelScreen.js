import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Modal,
} from "../components";
import { COLORS } from "../constants";
import { useParking } from "../hooks";
import { parkingService } from "../services/parkingService";

const AdminModalComponent = ({ visible, onClose, onSubmit, existingSlot }) => {
  const [formData, setFormData] = useState({
    slotNumber: "",
    type: "regular",
    status: "available",
    ...existingSlot,
  });

  useEffect(() => {
    if (existingSlot) {
      setFormData(existingSlot);
    } else {
      setFormData({ slotNumber: "", type: "regular", status: "available" });
    }
  }, [existingSlot, visible]);

  const handleSubmit = () => {
    if (!formData.slotNumber) {
      Alert.alert("Error", "Por favor ingresa el número de cupo");
      return;
    }
    onSubmit(formData);
    setFormData({ slotNumber: "", type: "regular", status: "available" });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {existingSlot ? "Editar Cupo" : "Crear Nuevo Cupo"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Input
              label="Número de Cupo"
              placeholder="Ej: A-001"
              value={formData.slotNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, slotNumber: text })
              }
            />

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Tipo de Cupo</Text>
              <View style={styles.selectOptions}>
                {["regular", "discapacitado", "carga"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectOption,
                      formData.type === type && styles.selectOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.type === type && styles.selectOptionTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Estado</Text>
              <View style={styles.selectOptions}>
                {["available", "reserved", "occupied"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.selectOption,
                      formData.status === status && styles.selectOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.status === status &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {status === "available"
                        ? "Disponible"
                        : status === "reserved"
                          ? "Reservado"
                          : "Ocupado"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              size="large"
            />
            <Button
              title="Guardar"
              variant="primary"
              onPress={handleSubmit}
              size="large"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AdminPanelScreen({ route, navigation }) {
  const { zoneId, zoneName } = route.params || {};
  const { selectedSlots, isLoading, fetchSlots } = useParking();
  const [slots, setSlots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (zoneId) {
      fetchSlots(zoneId);
    }
  }, [zoneId]);

  useEffect(() => {
    setSlots(selectedSlots);
  }, [selectedSlots]);

  const handleAddSlot = () => {
    setSelectedSlot(null);
    setModalVisible(true);
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const handleSubmitForm = async (formData) => {
    setLoadingAction(true);
    try {
      let result;
      if (selectedSlot?.id) {
        // Editar cupo existente
        result = await parkingService.updateSlot(zoneId, selectedSlot.id, {
          slotNumber: formData.slotNumber,
          type: formData.type,
          status: formData.status,
        });
      } else {
        // Crear nuevo cupo
        result = await parkingService.createSlot(zoneId, {
          slotNumber: formData.slotNumber,
          type: formData.type,
          status: formData.status,
        });
      }

      if (result.success) {
        Alert.alert(
          "Éxito",
          selectedSlot
            ? "Cupo actualizado correctamente"
            : "Cupo creado correctamente",
        );
        setModalVisible(false);
        await fetchSlots(zoneId);
      } else {
        Alert.alert("Error", result.error || "No se pudo guardar el cupo");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Error desconocido");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteSlot = (slot) => {
    Alert.alert(
      "Eliminar Cupo",
      `¿Deseas eliminar el cupo ${slot.slotNumber}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoadingAction(true);
            try {
              const result = await parkingService.deleteSlot(zoneId, slot.id);
              if (result.success) {
                Alert.alert("Éxito", "Cupo eliminado correctamente");
                await fetchSlots(zoneId);
              } else {
                Alert.alert("Error", result.error || "No se pudo eliminar");
              }
            } catch (error) {
              Alert.alert("Error", error.message || "Error desconocido");
            } finally {
              setLoadingAction(false);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return COLORS.success;
      case "reserved":
        return COLORS.warning;
      case "occupied":
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "reserved":
        return "Reservado";
      case "occupied":
        return "Ocupado";
      default:
        return status;
    }
  };

  const renderSlotItem = ({ item }) => (
    <Card>
      <CardHeader
        title={item.slotNumber}
        subtitle={item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
      />
      <CardBody>
        <View style={styles.slotContent}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
          <View style={styles.slotActions}>
            <TouchableOpacity
              onPress={() => handleEditSlot(item)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteSlot(item)}
              style={[styles.actionButton, styles.actionButtonDanger]}
            >
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CardBody>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{zoneName}</Text>
        <Text style={styles.headerSubtitle}>Panel de Gestión de Cupos</Text>
      </View>

      {isLoading && slots.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay cupos registrados en esta zona
                </Text>
              </View>
            }
          />

          <View style={styles.fabContainer}>
            <Button
              title="+ Agregar Cupo"
              onPress={handleAddSlot}
              variant="primary"
              size="large"
            />
          </View>
        </>
      )}

      <AdminModalComponent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitForm}
        existingSlot={selectedSlot}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.dark },
  headerSubtitle: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 12, paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyText: { color: COLORS.gray, fontSize: 16 },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    left: 12,
    right: 12,
    paddingHorizontal: 16,
  },
  slotContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  slotActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  actionButtonDanger: { backgroundColor: COLORS.danger },
  actionButtonText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.dark },
  closeButton: { fontSize: 24, color: COLORS.gray },
  modalBody: { paddingHorizontal: 16, paddingVertical: 16 },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  selectContainer: { marginVertical: 8 },
  selectLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 8,
  },
  selectOptions: { flexDirection: "row", gap: 8 },
  selectOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: "center",
  },
  selectOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectOptionText: { color: COLORS.gray, fontSize: 12, fontWeight: "600" },
  selectOptionTextActive: { color: COLORS.white },
});
