import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { Button, Card, CardBody, CardHeader } from "../components";
import { COLORS } from "../constants";

export default function NotificationsSettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState({
    reservationReminder: true,
    statusChanges: true,
    promotions: false,
    systemUpdates: true,
  });

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>
            Controla qué notificaciones deseas recibir
          </Text>
        </View>

        <Card>
          <CardHeader title="Alertas de Reservas" />
          <CardBody>
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>
                  Recordatorio de reserva próxima
                </Text>
                <Text style={styles.notificationDescription}>
                  Recibe alertas cuando una reserva está próxima a iniciar
                </Text>
              </View>
              <Switch
                value={notifications.reservationReminder}
                onValueChange={() => toggleNotification("reservationReminder")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>Cambios de estado</Text>
                <Text style={styles.notificationDescription}>
                  Notificaciones cuando tu reserva cambia de estado
                </Text>
              </View>
              <Switch
                value={notifications.statusChanges}
                onValueChange={() => toggleNotification("statusChanges")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Otras Notificaciones" />
          <CardBody>
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>Promociones</Text>
                <Text style={styles.notificationDescription}>
                  Ofertas especiales y descuentos
                </Text>
              </View>
              <Switch
                value={notifications.promotions}
                onValueChange={() => toggleNotification("promotions")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>
                  Actualizaciones del sistema
                </Text>
                <Text style={styles.notificationDescription}>
                  Noticias sobre mantenimiento y nuevas funciones
                </Text>
              </View>
              <Switch
                value={notifications.systemUpdates}
                onValueChange={() => toggleNotification("systemUpdates")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>
          </CardBody>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Volver"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.dark },
  subtitle: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  notificationContent: { flex: 1, marginRight: 12 },
  notificationLabel: { fontSize: 14, fontWeight: "600", color: COLORS.dark },
  notificationDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
  },
  buttonContainer: { paddingHorizontal: 16, paddingVertical: 20 },
});
