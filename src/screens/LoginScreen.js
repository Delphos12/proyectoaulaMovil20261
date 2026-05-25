import { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useDispatch } from "react-redux";
import { useTheme } from "../hooks";
import { getUserProfile, loginUser } from "../services/authService";
import { setUser } from "../store";
export default function LoginScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateField = (field, value) => {
    let error = "";
    if (field === "email") {
      if (!value) error = "El correo es requerido";
      else if (!isValidEmail(value))
        error = "Correo inválido (ej: usuario@email.com)";
    }
    if (field === "password") {
      if (!value) error = "La contraseña es requerida";
      else if (value.length < 6) error = "Mínimo 6 caracteres";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };
  const handleLogin = async () => {
    let hasErrors = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "El correo es requerido" }));
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Correo inválido" }));
      hasErrors = true;
    }
    if (!password) {
      setErrors((prev) => ({
        ...prev,
        password: "La contraseña es requerida",
      }));
      hasErrors = true;
    } else if (password.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Mínimo 6 caracteres" }));
      hasErrors = true;
    }
    if (hasErrors) return;
    setLoading(true);
    const result = await loginUser(email, password);
    if (result.success) {
      const profile = await getUserProfile(result.user.uid);
      dispatch(
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          nombre: profile?.nombre || "",
          ...profile,
        }),
      );
    } else {
      Alert.alert("Error de Autenticación", result.error);
    }
    setLoading(false);
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.dark }]}>Correo</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.dark,
              backgroundColor: colors.white,
              borderColor: colors.lightGray,
              placeholderTextColor: colors.gray,
            },
            focusedInput === "email" && [
              styles.inputFocused,
              { borderColor: colors.primary },
            ],
            errors.email && [styles.inputError, { borderColor: colors.danger }],
          ]}
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => {
            setFocusedInput(null);
            validateField("email", email);
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholderTextColor={colors.gray}
        />
        {errors.email ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.email}
          </Text>
        ) : null}
        <Text style={[styles.label, { color: colors.gray }]}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              focusedInput === "password" && styles.inputFocused,
              errors.password && styles.inputError,
              {
                color: colors.text,
                backgroundColor: colors.white,
                borderColor: colors.lightGray,
              },
            ]}
            placeholder="Contraseña"
            placeholderTextColor={colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => {
              setFocusedInput(null);
              validateField("password", password);
            }}
            textContentType="password"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
          >
            <FontAwesome5
              name={showPassword ? "eye-slash" : "eye"}
              size={20}
              color={colors.gray}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {errors.password}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.button,
            loading && styles.buttonDisabled,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 16 }}
        >
          <Text style={[styles.link, { color: colors.secondary }]}>
            ¿No tienes cuenta? Regístrate
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 50,
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: { marginBottom: 30 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#1F2937",
  },
  inputError: { borderColor: "#FF3B30" },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginBottom: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  passwordContainer: { position: "relative", marginBottom: 6 },
  passwordInput: { paddingRight: 48 },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 0,
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  inputFocused: {
    borderColor: "#007AFF",
    borderWidth: 2,
    boxShadow: "0px 3px 6px rgba(0, 122, 255, 0.15)",
    elevation: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    boxShadow: "0px 4px 8px rgba(0, 122, 255, 0.2)",
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
  },
});
