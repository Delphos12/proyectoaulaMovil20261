import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "./config/firebase";
import {
    cancelReservationThunk,
    createReservationThunk,
    fetchReservations,
    fetchSlots,
    fetchZones,
    logoutDone,
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
        }),
      ),
    fetchReservations: (userId) => dispatch(fetchReservations(userId)),
    cancelReservation: (reservationId, slotId, zoneId, userId) =>
      dispatch(cancelReservationThunk({ reservationId, userId })),
  };
};
