import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { Button, Card, CardBody, CardHeader, Input } from "../components";
import { COLORS } from "../constants";
import { useReservation } from "../hooks";
import { formatCurrency, formatDate, formatTime } from "../utils";

// Generar horas disponibles (6 AM a 10 PM)
const AVAILABLE_HOURS = Array.from({ length: 17 }, (_, i) => {
  const hour = 6 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function ReservationBookingScreen({ route, navigation }) {
  const { zoneId, slotId, slotNumber, zoneName, price } = route.params || {};
  const { isCreating, createError, createReservation } = useReservation();
  const { user } = useSelector((state) => state.auth);

  // Validar parámetros requeridos
  useEffect(() => {
    if (!zoneId || !slotId) {
      Alert.alert(
        "Error de Parámetros",
        "Faltan datos de la zona o del cupo. Por favor, vuelve e intenta nuevamente.",
        [{ text: "Aceptar", onPress: () => navigation.goBack() }],
      );
    }
  }, [zoneId, slotId, navigation]);

  // Valores por defecto: Hoy a la próxima hora disponible
  const getDefaultStartTime = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Si es para hoy y ya pasó las 9 AM, usa la próxima hora después de la actual
    if (currentHour >= 9) {
      const nextHour = currentHour + 1;
      // Si la próxima hora es después de las 22 (10 PM), usa 6 AM mañana
      if (nextHour >= 22) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(6, 0, 0, 0);
        return tomorrow;
      }
      // Sino, usa la próxima hora hoy
      now.setHours(nextHour, 0, 0, 0);
      return now;
    }

    // Si aún no son las 9 AM, usa 9 AM
    now.setHours(9, 0, 0, 0);
    return now;
  };

  const getDefaultEndTime = () => {
    const startTime = getDefaultStartTime();
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    return endTime;
  };

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(getDefaultStartTime());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(getDefaultEndTime());
  const [vehicleType, setVehicleType] = useState("carro");
  const [showPicker, setShowPicker] = useState({
    startDate: false,
    startTime: false,
    endDate: false,
    endTime: false,
    vehicle: false,
  });
  const [reservationAttempted, setReservationAttempted] = useState(false);

  useEffect(() => {
    if (reservationAttempted && !isCreating) {
      setReservationAttempted(false);

      if (createError) {
        Alert.alert(
          "Error al reservar",
          createError || "No se pudo crear la reserva.",
        );
      } else {
        // Navegar directamente sin esperar - igual que en cancelación
        const tabNavigator = navigation.getParent()?.getParent();
        if (tabNavigator) {
          tabNavigator.navigate("Reservations");
        } else {
          navigation.goBack();
        }
      }
    }
  }, [isCreating, reservationAttempted, createError, navigation]);

  const handlePickerChange = (field, setFn) => (event, date) => {
    if (Platform.OS === "android")
      setShowPicker((prev) => ({ ...prev, [field]: false }));
    if (date) setFn(date);
  };

  const combineDateTime = (date, time) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
    );

  const calculateDuration = () => {
    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);
    return (end - start) / 3600000;
  };

  const totalPrice = () => (price || 0) * Math.max(calculateDuration(), 1);

  // Validación de la reserva
  const validateReservation = () => {
    const duration = calculateDuration();

    // Validación 1: Duración debe ser positiva
    if (duration <= 0) {
      Alert.alert(
        "Horario Inválido",
        "La hora de salida debe ser posterior a la hora de entrada",
      );
      return false;
    }

    // Validación 2: No permitir duraciones mayores a 24 horas
    if (duration > 24) {
      Alert.alert("Duración Máxima", "No puedes reservar por más de 24 horas");
      return false;
    }

    const now = new Date();
    const horaInicioNum = startTime.getHours();
    const horaFinNum = endTime.getHours();

    // Validación 3: Horario del parqueadero (6 AM a 10 PM)
    // Solo validar la hora de inicio en el rango permitido
    if (horaInicioNum < 6 || horaInicioNum >= 22) {
      Alert.alert(
        "Fuera de Horario",
        "El parqueadero solo está abierto de 6:00 AM a 10:00 PM\nSelecciona una hora entre 6:00 AM y 9:00 PM",
      );
      return false;
    }

    // Validación 4: No permitir horas pasadas (si es para hoy)
    if (startDate.toDateString() === now.toDateString()) {
      const horaActual = now.getHours();
      const minutoActual = now.getMinutes();

      // Si la hora seleccionada ya pasó completamente
      if (horaInicioNum < horaActual) {
        Alert.alert(
          "Hora Inválida",
          "No puedes reservar para una hora que ya pasó",
        );
        return false;
      }

      // Si es la hora actual, debe ser al menos 30 minutos en el futuro
      if (horaInicioNum === horaActual && minutoActual > 30) {
        Alert.alert(
          "Hora Inválida",
          "Debes reservar con al menos 30 minutos de anticipación",
        );
        return false;
      }
    }

    return true;
  };

  const handleReserve = () => {
    if (!validateReservation()) {
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "Debes iniciar sesión para hacer una reserva");
      return;
    }

    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);

    const result = createReservation(
      user.uid,
      zoneId,
      slotId,
      start.toISOString(),
      end.toISOString(),
      totalPrice(),
      zoneName,
      slotNumber,
      vehicleType,
    );

    setReservationAttempted(true);
  };

  // Helper para obtener la hora en formato "HH:00"
  const getHourString = (date) => {
    if (!date) return "00:00";
    const hour = String(date.getHours()).padStart(2, "0");
    return `${hour}:00`;
  };

  const HourPickerModal = ({ visible, onClose, onSelect, currentValue }) => {
    const now = new Date();
    const isToday = startDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    // Generar horas disponibles (6 AM a 10 PM)
    let hours = Array.from({ length: 17 }, (_, i) => {
      const hour = 6 + i;
      return `${String(hour).padStart(2, "0")}:00`;
    });

    // Si es para hoy, filtrar horas pasadas
    if (isToday) {
      hours = hours.filter((hour) => {
        const [h] = hour.split(":");
        return parseInt(h) > currentHour;
      });
    }

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalCloseBtn}>Cerrar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {isToday ? "Horas Disponibles" : "Selecciona una Hora"}
              </Text>
              <View style={{ width: 60 }} />
            </View>

            {hours.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay horas disponibles para hoy después de las {currentHour}
                  :00
                </Text>
                <Text style={styles.emptySubtext}>
                  Intenta seleccionar otro día
                </Text>
              </View>
            ) : (
              <FlatList
                data={hours}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.hourItem,
                      item === currentValue && styles.hourItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.hourItemText,
                        item === currentValue && styles.hourItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const VehiclePickerModal = ({ visible, onClose }) => {
    const vehicles = [
      { label: "Carro", value: "carro" },
      { label: "Moto", value: "moto" },
      { label: "Bicicleta", value: "bicicleta" },
    ];

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalCloseBtn}>Cerrar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Selecciona Vehículo</Text>
              <View style={{ width: 60 }} />
            </View>

            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.vehicleItem,
                    item.value === vehicleType && styles.vehicleItemSelected,
                  ]}
                  onPress={() => {
                    setVehicleType(item.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.vehicleItemText,
                      item.value === vehicleType &&
                        styles.vehicleItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const PickerField = ({ label, value, field, mode, minimumDate }) => {
    // Para modo time, usar Modal con horas predefinidas
    if (mode === "time") {
      const currentHourValue =
        field === "startTime"
          ? getHourString(startTime)
          : getHourString(endTime);

      return (
        <>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() =>
              setShowPicker((prev) => ({ ...prev, [field]: true }))
            }
          >
            <Input
              label={label}
              value={currentHourValue}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          <HourPickerModal
            visible={showPicker[field]}
            onClose={() =>
              setShowPicker((prev) => ({ ...prev, [field]: false }))
            }
            onSelect={(hour) => {
              if (field === "startTime") {
                const newTime = new Date(startTime);
                const [h] = hour.split(":");
                newTime.setHours(parseInt(h), 0, 0, 0);
                setStartTime(newTime);

                // Ajustar hora de fin automáticamente (1 hora después)
                const endTimeAuto = new Date(newTime);
                endTimeAuto.setHours(endTimeAuto.getHours() + 1);
                setEndTime(endTimeAuto);
              } else {
                const newTime = new Date(endTime);
                const [h] = hour.split(":");
                newTime.setHours(parseInt(h), 0, 0, 0);
                setEndTime(newTime);
              }
            }}
            currentValue={currentHourValue}
          />
        </>
      );
    }

    // Para modo date, usar DateTimePicker
    return (
      <>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker((prev) => ({ ...prev, [field]: true }))}
        >
          <Input
            label={label}
            value={value}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showPicker[field] && (
          <DateTimePicker
            value={
              field.includes("Date")
                ? field === "startDate"
                  ? startDate
                  : endDate
                : field === "startTime"
                  ? startTime
                  : endTime
            }
            mode={mode}
            display="default"
            onChange={handlePickerChange(
              field,
              field === "startDate"
                ? setStartDate
                : field === "endDate"
                  ? setEndDate
                  : field === "startTime"
                    ? setStartTime
                    : setEndTime,
            )}
            minimumDate={minimumDate}
            is24Hour={mode === "time"}
          />
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader
          title={`Cupo ${slotNumber ?? slotId}`}
          subtitle={`${zoneName ?? "Zona " + zoneId} - ${formatCurrency(price || 0)}/hora`}
        />
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Fecha y Hora de Inicio" />
        <CardBody>
          <PickerField
            label="Fecha"
            value={formatDate(startDate)}
            field="startDate"
            mode="date"
            minimumDate={new Date()}
          />
          <PickerField
            label="Hora"
            value={formatTime(startTime)}
            field="startTime"
            mode="time"
          />
        </CardBody>
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Fecha y Hora de Salida" />
        <CardBody>
          <PickerField
            label="Fecha"
            value={formatDate(endDate)}
            field="endDate"
            mode="date"
            minimumDate={startDate}
          />
          <PickerField
            label="Hora"
            value={formatTime(endTime)}
            field="endTime"
            mode="time"
          />
        </CardBody>
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Tipo de Vehículo" />
        <CardBody>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() =>
              setShowPicker((prev) => ({ ...prev, vehicle: true }))
            }
          >
            <Input
              label="Vehículo"
              value={vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          <VehiclePickerModal
            visible={showPicker.vehicle}
            onClose={() =>
              setShowPicker((prev) => ({ ...prev, vehicle: false }))
            }
          />
        </CardBody>
      </Card>

      <Card style={styles.card}>
        <CardHeader title="Resumen de tu Reserva" />
        <CardBody>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zona:</Text>
            <Text style={styles.summaryValue}>
              {zoneName ?? "Zona " + zoneId}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cupo:</Text>
            <Text style={styles.summaryValue}>{slotNumber ?? slotId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehículo:</Text>
            <Text style={styles.summaryValue}>
              {vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrada:</Text>
            <Text style={styles.summaryValue}>
              {formatDate(startDate)} - {getHourString(startTime)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Salida:</Text>
            <Text style={styles.summaryValue}>
              {formatDate(endDate)} - {getHourString(endTime)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duración:</Text>
            <Text style={styles.summaryValue}>
              {calculateDuration().toFixed(1)} horas
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tarifa:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(price || 0)}/hora
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalPrice())}
            </Text>
          </View>
        </CardBody>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => navigation.goBack()}
          size="large"
        />
        <Button
          title="Reservar"
          variant="primary"
          onPress={handleReserve}
          loading={isCreating}
          size="large"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  card: { marginBottom: 16 },
  dateButton: { marginVertical: 8 },
  pickerContainer: { marginVertical: 12 },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  totalRow: { borderBottomWidth: 0, marginTop: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.darkGray, fontWeight: "500" },
  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  totalLabel: { fontSize: 16, color: COLORS.text, fontWeight: "700" },
  totalValue: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },
  buttonContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalCloseBtn: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  // Hour Item Styles
  hourItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  hourItemSelected: {
    backgroundColor: COLORS.background,
  },
  hourItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  hourItemTextSelected: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  // Vehicle Item Styles
  vehicleItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  vehicleItemSelected: {
    backgroundColor: COLORS.background,
  },
  vehicleItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  vehicleItemTextSelected: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
});
