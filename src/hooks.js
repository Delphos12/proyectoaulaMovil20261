import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "./config/firebase";
import {
    cancelReservationThunk,
    completeReservationThunk,
    createReservationThunk,
    fetchActiveReservations,
    fetchHistoricReservations,
    fetchReservations,
    fetchSlots,
    fetchZones,
    logoutDone,
    markReservationAsInUseThunk,
    persistor,
} from "./store";

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(logoutDone());
    persistor.purge();
    signOut(auth).catch((e) => console.error("Error al cerrar sesión:", e));
  };

  return { ...authState, logout };
};

export const useParking = () => {
  const dispatch = useDispatch();
  const parking = useSelector((state) => state.parking);

  return {
    ...parking,
    fetchZones: () => dispatch(fetchZones()),
    fetchSlots: (zoneId) => dispatch(fetchSlots(zoneId)),
  };
};

export const useReservation = () => {
  const dispatch = useDispatch();
  const reservation = useSelector((state) => state.reservation);

  return {
    ...reservation,
    createReservation: (
      userId,
      zoneId,
      slotId,
      startTime,
      endTime,
      price,
      zoneName,
      slotNumber,
      vehicleType,
    ) =>
      dispatch(
        createReservationThunk({
          userId,
          zoneId,
          slotId,
          startTime,
          endTime,
          price,
          zoneName,
          slotNumber,
          vehicleType,
        }),
      ),
    fetchReservations: (userId) => dispatch(fetchReservations(userId)),
    fetchActiveReservations: (userId) =>
      dispatch(fetchActiveReservations(userId)),
    fetchHistoricReservations: (userId) =>
      dispatch(fetchHistoricReservations(userId)),
    cancelReservation: (reservationId, slotId, zoneId, userId) =>
      dispatch(cancelReservationThunk({ reservationId, userId })),
    markReservationAsInUse: (reservationId, userId) =>
      dispatch(markReservationAsInUseThunk({ reservationId, userId })),
    completeReservation: (reservationId, userId) =>
      dispatch(completeReservationThunk({ reservationId, userId })),
  };
};

export const useTheme = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);
  const { COLORS_LIGHT, COLORS_DARK } = require("./constants");

  return {
    isDarkMode,
    colors: isDarkMode ? COLORS_DARK : COLORS_LIGHT,
    toggleDarkMode: () => dispatch(require("./store").toggleDarkMode()),
  };
};
