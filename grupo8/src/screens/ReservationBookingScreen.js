import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Alert,
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

export default function ReservationBookingScreen({ route, navigation }) {
  const { zoneId, slotId, slotNumber, zoneName, price } = route.params || {};
  const { isCreating, createError, createReservation } = useReservation();
  const { user } = useSelector((state) => state.auth);

  const [pending, setPending] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000));
  const [showPicker, setShowPicker] = useState({
    startDate: false,
    startTime: false,
    endDate: false,
    endTime: false,
  });

  useEffect(() => {
    if (pending && !isCreating) {
      setPending(false);
      if (createError) {
        Alert.alert(
          "Error al reservar",
          createError || "No se pudo crear la reserva.",
        );
      } else {
        Alert.alert(
          "¡Reserva Confirmada!",
          "Tu reserva fue creada exitosamente.",
          [
            {
              text: "Aceptar",
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  navigation.getParent()?.navigate("Tabs", {
                    screen: "Reservations",
                    params: { screen: "ReservationsTab" },
                  });
                }, 100);
              },
            },
          ],
        );
      }
    }
  }, [isCreating, pending]);

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

  const handleReserve = () => {
    const duration = calculateDuration();
    if (duration <= 0)
      return Alert.alert(
        "Error",
        "La hora final debe ser posterior a la hora inicial",
      );
    if (!user?.uid)
      return Alert.alert(
        "Error",
        "Debes iniciar sesión para hacer una reserva",
      );

    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(endDate, endTime);
    createReservation(
      user.uid,
      zoneId,
      slotId,
      start.toISOString(),
      end.toISOString(),
      totalPrice(),
      zoneName,
      slotNumber,
    );
    setPending(true);
  };

  const PickerField = ({ label, value, field, mode, minimumDate }) => (
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
        <CardHeader title="Resumen" />
        <CardBody>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duración:</Text>
            <Text style={styles.summaryValue}>
              {calculateDuration().toFixed(1)} horas
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio/hora:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(price || 0)}
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
          loading={isCreating || pending}
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
});
