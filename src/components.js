import {
  ActivityIndicator,
  Modal as RNModal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "./hooks";

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  const getButtonStyle = () => {
    const base = [btnStyles.button];
    base.push({ backgroundColor: colors[variant] });
    if (variant === "outline") {
      base.push({
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.primary,
      });
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
          color={variant === "outline" ? colors.primary : colors.white}
        />
      ) : (
        <Text
          style={[
            btnStyles.buttonText,
            { color: variant === "outline" ? colors.primary : colors.white },
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
  disabledButton: { opacity: 0.5 },
  largeButton: { paddingVertical: 16, paddingHorizontal: 24 },
  smallButton: { paddingVertical: 8, paddingHorizontal: 12 },
  buttonText: { fontWeight: "600", fontSize: 16 },
});

export const Card = ({ children, onPress, style, colors: propColors }) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  const content = (
    <View
      style={[
        cardStyles.card,
        { backgroundColor: colors.white, borderColor: colors.lightGray },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress)
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
};

export const CardHeader = ({ title, subtitle, style, colors: propColors }) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  return (
    <View
      style={[
        cardStyles.header,
        { borderBottomColor: colors.lightGray },
        style,
      ]}
    >
      <Text style={[cardStyles.title, { color: colors.dark }]}>{title}</Text>
      {subtitle && (
        <Text style={[cardStyles.subtitle, { color: colors.gray }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export const CardBody = ({ children, style }) => (
  <View style={[cardStyles.body, style]}>{children}</View>
);

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 4 },
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
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  return (
    <View style={inputStyles.container}>
      {label && (
        <Text style={[inputStyles.label, { color: colors.dark }]}>{label}</Text>
      )}
      <TextInput
        style={[
          inputStyles.input,
          {
            color: colors.dark,
            backgroundColor: colors.white,
            borderColor: colors.lightGray,
          },
          error && { borderColor: colors.danger },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.lightGray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
      />
      {error && (
        <Text style={[inputStyles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: { fontSize: 12, marginTop: 4 },
});

export const LoadingSpinner = ({
  visible = true,
  message = "Cargando...",
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  if (!visible) return null;
  return (
    <View style={[statusStyles.container, { backgroundColor: colors.white }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[statusStyles.text, { color: colors.gray }]}>{message}</Text>
    </View>
  );
};

const statusStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { marginTop: 16, fontSize: 16 },
});

export const SegmentedButtons = ({
  options,
  value,
  onChange,
  style,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  return (
    <View
      style={[
        filterStyles.segmentedContainer,
        { backgroundColor: colors.light },
        style,
      ]}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            filterStyles.segmentButton,
            value === option.value && { backgroundColor: colors.primary },
          ]}
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              filterStyles.segmentButtonText,
              { color: colors.gray },
              value === option.value && { color: colors.white },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const filterStyles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export const SearchBar = ({
  placeholder,
  value,
  onChangeText,
  style,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  return (
    <View style={[searchStyles.container, style]}>
      <TextInput
        style={[
          searchStyles.input,
          {
            color: colors.dark,
            backgroundColor: colors.white,
            borderColor: colors.lightGray,
          },
        ]}
        placeholder={placeholder || "Buscar..."}
        placeholderTextColor={colors.gray}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const searchStyles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});

export const Modal = ({
  visible,
  children,
  transparent = true,
  animationType = "slide",
}) => (
  <RNModal
    visible={visible}
    transparent={transparent}
    animationType={animationType}
  >
    {children}
  </RNModal>
);

export const AlertBanner = ({
  type = "info",
  message,
  onClose,
  visible = true,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  if (!visible) return null;

  const getAlertStyle = () => {
    switch (type) {
      case "success":
        return { backgroundColor: colors.success };
      case "error":
        return { backgroundColor: colors.danger };
      case "warning":
        return { backgroundColor: colors.warning };
      default:
        return { backgroundColor: colors.info };
    }
  };

  const getAlertIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  return (
    <View style={[alertStyles.container, getAlertStyle()]}>
      <Text style={[alertStyles.icon, { color: colors.white }]}>
        {getAlertIcon()}
      </Text>
      <Text style={[alertStyles.message, { color: colors.white }]}>
        {message}
      </Text>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Text style={[alertStyles.close, { color: colors.white }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const alertStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    gap: 12,
  },
  icon: { fontSize: 18, fontWeight: "700" },
  message: { flex: 1, fontWeight: "600", fontSize: 14 },
  close: { fontSize: 18, fontWeight: "700" },
});

export const NotificationItem = ({
  label,
  description,
  value,
  onToggle,
  colors: propColors,
}) => {
  const { colors: themeColors } = useTheme();
  const colors = propColors || themeColors;
  return (
    <View style={notificationItemStyles.container}>
      <View style={notificationItemStyles.content}>
        <Text style={[notificationItemStyles.label, { color: colors.dark }]}>
          {label}
        </Text>
        <Text
          style={[notificationItemStyles.description, { color: colors.gray }]}
        >
          {description}
        </Text>
      </View>
      <TouchableOpacity onPress={onToggle}>
        <Text
          style={[notificationItemStyles.toggle, { color: colors.primary }]}
        >
          {value ? "✓" : "○"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const notificationItemStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  content: { flex: 1, marginRight: 12 },
  label: { fontSize: 14, fontWeight: "600" },
  description: { fontSize: 12, marginTop: 4 },
  toggle: { fontSize: 20 },
});
