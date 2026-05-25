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

export default function PrivacySettingsScreen({ navigation }) {
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    shareData: false,
    analytics: true,
  });

  const togglePrivacy = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacidad</Text>
          <Text style={styles.subtitle}>
            Administra tu privacidad y datos personales
          </Text>
        </View>

        <Card>
          <CardHeader title="Visibilidad de Perfil" />
          <CardBody>
            <View style={styles.privacyItem}>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyLabel}>Perfil Público</Text>
                <Text style={styles.privacyDescription}>
                  Otros usuarios pueden ver tu perfil
                </Text>
              </View>
              <Switch
                value={privacy.profilePublic}
                onValueChange={() => togglePrivacy("profilePublic")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Datos y Análisis" />
          <CardBody>
            <View style={styles.privacyItem}>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyLabel}>Compartir Datos</Text>
                <Text style={styles.privacyDescription}>
                  Permitir que compartamos datos con servicios asociados
                </Text>
              </View>
              <Switch
                value={privacy.shareData}
                onValueChange={() => togglePrivacy("shareData")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.privacyItem}>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyLabel}>Análisis Anónimo</Text>
                <Text style={styles.privacyDescription}>
                  Ayúdanos a mejorar con datos anónimos de uso
                </Text>
              </View>
              <Switch
                value={privacy.analytics}
                onValueChange={() => togglePrivacy("analytics")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              />
            </View>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Información Importante" />
          <CardBody>
            <Text style={styles.infoText}>
              📋 Leer nuestras{" "}
              <Text style={styles.link}>Políticas de Privacidad</Text>
            </Text>
            <Text style={styles.infoText}>
              📄 Leer nuestros{" "}
              <Text style={styles.link}>Términos de Servicio</Text>
            </Text>
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
  privacyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  privacyContent: { flex: 1, marginRight: 12 },
  privacyLabel: { fontSize: 14, fontWeight: "600", color: COLORS.dark },
  privacyDescription: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
  },
  infoText: { fontSize: 13, color: COLORS.dark, marginVertical: 8 },
  link: { color: COLORS.primary, fontWeight: "600" },
  buttonContainer: { paddingHorizontal: 16, paddingVertical: 20 },
});
