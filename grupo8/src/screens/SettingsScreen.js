import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, CardBody, CardHeader, Input } from "../components";
import { COLORS } from "../constants";
import { useAuth } from "../hooks";
import { updateUserProfile } from "../services/authService";
import { setUser } from "../store";

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const [editable, setEditable] = useState(false);
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleChange = (field, value) =>
    setUserData({ ...userData, [field]: value });

  const handleSaveProfile = async () => {
    const fullName = `${userData.firstName} ${userData.lastName}`.trim();
    const result = await updateUserProfile(user.uid, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      nombre: fullName,
    });
    if (result.success) {
      dispatch(setUser({ ...user, ...userData, nombre: fullName }));
      setEditable(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } else {
      Alert.alert("Error", result.error || "No se pudo actualizar el perfil");
    }
  };

  const handleLogout = () => {
    logout();
  };

  const displayName =
    `${userData.firstName} ${userData.lastName}`.trim() ||
    user?.nombre ||
    user?.email ||
    "Usuario";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        <Card>
          <CardHeader title={displayName} />
          <CardBody>
            {editable ? (
              <>
                <Input
                  label="Nombre"
                  value={userData.firstName}
                  onChangeText={(v) => handleChange("firstName", v)}
                />
                <Input
                  label="Apellido"
                  value={userData.lastName}
                  onChangeText={(v) => handleChange("lastName", v)}
                />
                <Input label="Correo" value={userData.email} editable={false} />
                <Input
                  label="Teléfono"
                  value={userData.phone}
                  onChangeText={(v) => handleChange("phone", v)}
                  keyboardType="phone-pad"
                />
                <View style={styles.buttonGroup}>
                  <Button
                    title="Guardar"
                    onPress={handleSaveProfile}
                    variant="primary"
                    size="small"
                  />
                  <Button
                    title="Cancelar"
                    onPress={() => setEditable(false)}
                    variant="outline"
                    size="small"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.profileItem}>
                  <Text style={styles.label}>Correo:</Text>
                  <Text style={styles.value}>{userData.email}</Text>
                </View>
                <View style={styles.profileItem}>
                  <Text style={styles.label}>Teléfono:</Text>
                  <Text style={styles.value}>
                    {userData.phone || "No especificado"}
                  </Text>
                </View>
                <Button
                  title="Editar Perfil"
                  onPress={() => setEditable(true)}
                  variant="primary"
                />
              </>
            )}
          </CardBody>
        </Card>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          {[
            "Notificaciones",
            "Privacidad",
            "Historial de Reservas",
            "Ayuda y Soporte",
          ].map((item) => (
            <TouchableOpacity key={item} style={styles.settingItem}>
              <Text style={styles.settingLabel}>{item}</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            size="large"
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
  profileItem: { marginVertical: 8 },
  label: { fontSize: 12, color: COLORS.gray },
  value: { fontSize: 14, fontWeight: "600", color: COLORS.dark, marginTop: 4 },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  settingsContainer: { marginHorizontal: 12, marginTop: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginVertical: 12,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabel: { fontSize: 14, color: COLORS.dark, fontWeight: "500" },
  settingArrow: { fontSize: 18, color: COLORS.gray },
  logoutContainer: { paddingHorizontal: 16, paddingVertical: 32 },
});
