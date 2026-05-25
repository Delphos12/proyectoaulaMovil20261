import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, CardBody, CardHeader } from "../components";
import { COLORS } from "../constants";

export default function HelpAndSupportScreen({ navigation }) {
  const faqItems = [
    {
      question: "¿Cómo hago una reserva?",
      answer:
        "Ve a la sección Parqueaderos, selecciona una zona, elige un cupo disponible y reserva con la fecha y hora que necesites.",
    },
    {
      question: "¿Puedo cancelar mi reserva?",
      answer:
        "Sí, puedes cancelar reservas en estado 'Reservado'. Ve a Mis Reservas y presiona Cancelar Reserva.",
    },
    {
      question: "¿Cómo veo mi historial de reservas?",
      answer:
        "En la pestaña Reservas puedes ver todas tus reservas actuales e históricas con filtros por estado y fecha.",
    },
    {
      question: "¿Qué debo hacer si tengo un problema?",
      answer:
        "Contáctanos a través del correo support@parksmart.com o llama al +57 1 2345678.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ayuda y Soporte</Text>
          <Text style={styles.subtitle}>Resuelve tus dudas y obtén apoyo</Text>
        </View>

        <Card>
          <CardHeader title="Preguntas Frecuentes" />
          <CardBody>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.question}>❓ {item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
                {index < faqItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Contacto" />
          <CardBody>
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>📧 Correo Electrónico</Text>
              <Text style={styles.contactValue}>support@parksmart.com</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>📞 Teléfono</Text>
              <Text style={styles.contactValue}>+57 1 2345678</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactItem}>
              <Text style={styles.contactLabel}>🕒 Horario de Atención</Text>
              <Text style={styles.contactValue}>
                Lunes a Viernes: 8:00 AM - 6:00 PM
              </Text>
            </View>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Información de la App" />
          <CardBody>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Versión</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Desarrollador</Text>
              <Text style={styles.infoValue}>Grupo 8</Text>
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
  faqItem: { marginVertical: 12 },
  question: { fontSize: 13, fontWeight: "600", color: COLORS.dark },
  answer: { fontSize: 12, color: COLORS.gray, marginTop: 6, lineHeight: 18 },
  contactItem: { marginVertical: 8 },
  contactLabel: { fontSize: 13, fontWeight: "600", color: COLORS.dark },
  contactValue: { fontSize: 12, color: COLORS.primary, marginTop: 4 },
  infoItem: { marginVertical: 8 },
  infoLabel: { fontSize: 13, fontWeight: "600", color: COLORS.dark },
  infoValue: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
  },
  buttonContainer: { paddingHorizontal: 16, paddingVertical: 20 },
});
