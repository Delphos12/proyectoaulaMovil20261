import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "./constants";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
}) => {
  const getButtonStyle = () => {
    const base = [btnStyles.button];
    switch (variant) {
      case "secondary":
        base.push(btnStyles.secondaryButton);
        break;
      case "danger":
        base.push(btnStyles.dangerButton);
        break;
      case "outline":
        base.push(btnStyles.outlineButton);
        break;
      default:
        base.push(btnStyles.primaryButton);
    }
    if (size === "large") base.push(btnStyles.largeButton);
    else if (size === "small") base.push(btnStyles.smallButton);
    if (disabled) base.push(btnStyles.disabledButton);
    return base;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? COLORS.primary : COLORS.white}
        />
      ) : (
        <Text
          style={[
            btnStyles.buttonText,
            variant === "outline" && btnStyles.outlineButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButton: { backgroundColor: COLORS.primary },
  secondaryButton: { backgroundColor: COLORS.secondary },
  dangerButton: { backgroundColor: COLORS.danger },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: { opacity: 0.5 },
  largeButton: { paddingVertical: 16, paddingHorizontal: 24 },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12 },
  buttonText: { color: COLORS.white, fontWeight: "600", fontSize: 16 },
  outlineButtonText: { color: COLORS.primary },
});

export const Card = ({ children, onPress, style }) => {
  const content = <View style={[cardStyles.card, style]}>{children}</View>;
  if (onPress)
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
};

export const CardHeader = ({ title, subtitle, style }) => (
  <View style={[cardStyles.header, style]}>
    <Text style={cardStyles.title}>{title}</Text>
    {subtitle && <Text style={cardStyles.subtitle}>{subtitle}</Text>}
  </View>
);

export const CardBody = ({ children, style }) => (
  <View style={[cardStyles.body, style]}>{children}</View>
);

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: { fontSize: 16, fontWeight: "700", color: COLORS.dark },
  subtitle: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  body: { paddingVertical: 8 },
});

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}) => (
  <View style={inputStyles.container}>
    {label && <Text style={inputStyles.label}>{label}</Text>}
    <TextInput
      style={[inputStyles.input, error && inputStyles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.lightGray}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
    />
    {error && <Text style={inputStyles.errorText}>{error}</Text>}
  </View>
);

const inputStyles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
});

export const LoadingSpinner = ({ visible = true, message = "Cargando..." }) => {
  if (!visible) return null;
  return (
    <View style={statusStyles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={statusStyles.text}>{message}</Text>
    </View>
  );
};

const statusStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  text: { marginTop: 16, fontSize: 16, color: COLORS.gray },
});
