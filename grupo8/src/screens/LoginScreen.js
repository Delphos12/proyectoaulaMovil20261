import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useDispatch } from "react-redux";
import { COLORS } from "../constants";
import { getUserProfile, loginUser } from "../services/authService";
import { setUser } from "../store";
export default function LoginScreen({ navigation }) {
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
    <View style={styles.container}>
      <Text style={styles.title}>ParkSmart</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "email" && styles.inputFocused,
            errors.email && styles.inputError,
          ]}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => {
            setFocusedInput(null);
            validateField("email", email);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              focusedInput === "password" && styles.inputFocused,
              errors.password && styles.inputError,
            ]}
            placeholder="••••••••"
            placeholderTextColor={COLORS.gray}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => {
              setFocusedInput(null);
              validateField("password", password);
            }}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <FontAwesome5
              name={showPassword ? "eye-slash" : "eye"}
              size={18}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 50,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
  formContainer: { marginBottom: 30 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    fontSize: 16,
    color: COLORS.dark,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
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
    borderColor: COLORS.secondary,
    borderWidth: 2,
    boxShadow: "0px 3px 6px rgba(0, 122, 255, 0.15)",
    elevation: 5,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    boxShadow: "0px 4px 8px rgba(0, 122, 255, 0.2)",
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  link: {
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
  },
});
