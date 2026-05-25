import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "./components";
import { useTheme } from "./hooks";
import AdminPanelScreen from "./screens/AdminPanelScreen";
import HelpAndSupportScreen from "./screens/HelpAndSupportScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationsSettingsScreen from "./screens/NotificationsSettingsScreen";
import ParkingSlotsScreen from "./screens/ParkingSlotsScreen";
import ParkingZonesScreen from "./screens/ParkingZonesScreen";
import PrivacySettingsScreen from "./screens/PrivacySettingsScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ReservationBookingScreen from "./screens/ReservationBookingScreen";
import ReservationDetailScreen from "./screens/ReservationDetailScreen";
import ReservationsScreen from "./screens/ReservationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SlotDetailScreen from "./screens/SlotDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Navigation() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { isDarkMode, colors } = useTheme();

  const headerStyle = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontWeight: "700", color: colors.text },
  };

  const HomeStack = () => (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen
        name="HomeTab"
        children={(props) => <HomeScreen {...props} colors={colors} />}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );

  const ParkingStack = () => (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen
        name="ParkingZones"
        children={(props) => <ParkingZonesScreen {...props} colors={colors} />}
        options={{ title: "Zonas de Parqueadero" }}
      />
      <Stack.Screen
        name="ParkingSlots"
        children={(props) => <ParkingSlotsScreen {...props} colors={colors} />}
        options={{ title: "Cupos Disponibles" }}
      />
      <Stack.Screen
        name="SlotDetail"
        children={(props) => <SlotDetailScreen {...props} colors={colors} />}
        options={{ title: "Detalle del Cupo" }}
      />
      <Stack.Screen
        name="AdminPanel"
        children={(props) => <AdminPanelScreen {...props} colors={colors} />}
        options={{ title: "Gestión de Cupos" }}
      />
    </Stack.Navigator>
  );

  const ReservationsStack = () => (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen
        name="ReservationsTab"
        children={(props) => <ReservationsScreen {...props} colors={colors} />}
        options={{ title: "Mis Reservas" }}
      />
      <Stack.Screen
        name="ReservationDetail"
        children={(props) => (
          <ReservationDetailScreen {...props} colors={colors} />
        )}
        options={{ title: "Detalles de Reserva" }}
      />
    </Stack.Navigator>
  );

  const SettingsStack = () => (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen
        name="SettingsTab"
        children={(props) => <SettingsScreen {...props} colors={colors} />}
        options={{ title: "Configuración" }}
      />
      <Stack.Screen
        name="NotificationsSettings"
        children={(props) => (
          <NotificationsSettingsScreen {...props} colors={colors} />
        )}
        options={{ title: "Notificaciones" }}
      />
      <Stack.Screen
        name="PrivacySettings"
        children={(props) => (
          <PrivacySettingsScreen {...props} colors={colors} />
        )}
        options={{ title: "Privacidad" }}
      />
      <Stack.Screen
        name="ReservationsHistory"
        children={(props) => <ReservationsScreen {...props} colors={colors} />}
        options={{ title: "Historial de Reservas" }}
      />
      <Stack.Screen
        name="HelpAndSupport"
        children={(props) => (
          <HelpAndSupportScreen {...props} colors={colors} />
        )}
        options={{ title: "Ayuda y Soporte" }}
      />
    </Stack.Navigator>
  );

  const TabNavigator = ({ colors }) => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home",
            Parking: "local-parking",
            Reservations: "assignment",
            Settings: "settings",
          };
          return (
            <MaterialIcons name={icons[route.name]} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.lightGray,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name="Parking"
        component={ParkingStack}
        options={{ title: "Parqueaderos" }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationsStack}
        options={{ title: "Reservas" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );

  const MainApp = ({ colors }) => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Tabs"
        children={() => <TabNavigator colors={colors} />}
      />
      <Stack.Screen
        name="ReservationBooking"
        children={(props) => (
          <ReservationBookingScreen {...props} colors={colors} />
        )}
        options={{
          headerShown: true,
          title: "Nueva Reserva",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );

  if (isLoading) return <LoadingSpinner visible />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            children={(props) => <LoginScreen {...props} colors={colors} />}
          />
          <Stack.Screen
            name="Register"
            children={(props) => <RegisterScreen {...props} colors={colors} />}
            options={{ title: "Crear Cuenta" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="AppTabs"
          children={() => <MainApp colors={colors} />}
        />
      )}
    </Stack.Navigator>
  );
}

export default Navigation;
