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
import { getUserProfile, registerUser } from "../services/authService";
import { setUser } from "../store";
export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateField = (field, value) => {
    let error = "";
    if (field === "nombre") {
      if (!value) error = "El nombre es requerido";
      else if (value.trim().length < 2) error = "Mínimo 2 caracteres";
    }
    if (field === "email") {
      if (!value) error = "El correo es requerido";
      else if (!isValidEmail(value))
        error = "Correo inválido (ej: usuario@email.com)";
    }
    if (field === "password") {
      if (!value) error = "La contraseña es requerida";
      else if (value.length < 6) error = "Mínimo 6 caracteres";
    }
    if (field === "confirmPassword") {
      if (!value) error = "Confirma tu contraseña";
      else if (value !== password) error = "Las contraseñas no coinciden";
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };
  const handleRegister = async () => {
    let hasErrors = false;
    if (!nombre) {
      setErrors((prev) => ({ ...prev, nombre: "El nombre es requerido" }));
      hasErrors = true;
    } else if (nombre.trim().length < 2) {
      setErrors((prev) => ({ ...prev, nombre: "Mínimo 2 caracteres" }));
      hasErrors = true;
    }
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
    if (!confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Confirma tu contraseña",
      }));
      hasErrors = true;
    } else if (confirmPassword !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      hasErrors = true;
    }
    if (hasErrors) return;
    setLoading(true);
    const result = await registerUser(email, password, nombre);
    if (result.success) {
      const profile = await getUserProfile(result.uid);
      dispatch(setUser({ uid: result.uid, email, nombre, ...profile }));
    } else {
      Alert.alert("Error de Registro", result.error);
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>← Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Crear Cuenta</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "nombre" && styles.inputFocused,
            errors.nombre && styles.inputError,
          ]}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.gray}
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: "" }));
          }}
          onFocus={() => setFocusedInput("nombre")}
          onBlur={() => {
            setFocusedInput(null);
            validateField("nombre", nombre);
          }}
          autoCapitalize="words"
          editable={!loading}
        />
        {errors.nombre ? (
          <Text style={styles.errorText}>{errors.nombre}</Text>
        ) : null}
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
        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              focusedInput === "confirmPassword" && styles.inputFocused,
              errors.confirmPassword && styles.inputError,
            ]}
            placeholder="••••••••"
            placeholderTextColor={COLORS.gray}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            onFocus={() => setFocusedInput("confirmPassword")}
            onBlur={() => {
              setFocusedInput(null);
              validateField("confirmPassword", confirmPassword);
            }}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            <FontAwesome5
              name={showConfirmPassword ? "eye-slash" : "eye"}
              size={18}
              color={COLORS.secondary}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cargando..." : "Registrarse"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  backButton: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 36,
    color: COLORS.dark,
    letterSpacing: 0.5,
  },
  formContainer: { marginBottom: 28 },
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
