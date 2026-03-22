import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "./components";
import { COLORS } from "./constants";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ParkingSlotsScreen from "./screens/ParkingSlotsScreen";
import ParkingZonesScreen from "./screens/ParkingZonesScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ReservationBookingScreen from "./screens/ReservationBookingScreen";
import ReservationDetailScreen from "./screens/ReservationDetailScreen";
import ReservationsScreen from "./screens/ReservationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SlotDetailScreen from "./screens/SlotDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: COLORS.white },
  headerTintColor: COLORS.primary,
  headerTitleStyle: { fontWeight: "700" },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const ParkingStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name="ParkingZones"
      component={ParkingZonesScreen}
      options={{ title: "Zonas de Parqueadero" }}
    />
    <Stack.Screen
      name="ParkingSlots"
      component={ParkingSlotsScreen}
      options={{ title: "Cupos Disponibles" }}
    />
    <Stack.Screen
      name="SlotDetail"
      component={SlotDetailScreen}
      options={{ title: "Detalle del Cupo" }}
    />
  </Stack.Navigator>
);

const ReservationsStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name="ReservationsTab"
      component={ReservationsScreen}
      options={{ title: "Mis Reservas" }}
    />
    <Stack.Screen
      name="ReservationDetail"
      component={ReservationDetailScreen}
      options={{ title: "Detalles de Reserva" }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name="SettingsTab"
      component={SettingsScreen}
      options={{ title: "Configuración" }}
    />
  </Stack.Navigator>
);

const TabNavigator = () => (
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
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.lightGray,
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

const MainApp = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen
      name="ReservationBooking"
      component={ReservationBookingScreen}
      options={{
        headerShown: true,
        title: "Nueva Reserva",
        presentation: "card",
      }}
    />
  </Stack.Navigator>
);

export default function Navigation() {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <LoadingSpinner visible />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Crear Cuenta" }}
          />
        </>
      ) : (
        <Stack.Screen name="AppTabs" component={MainApp} />
      )}
    </Stack.Navigator>
  );
}
