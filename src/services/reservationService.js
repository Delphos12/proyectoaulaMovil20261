import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

const toPlain = (obj) => {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] && typeof result[key].toDate === "function")
      result[key] = result[key].toDate().toISOString();
  }
  return result;
};

const mapDocs = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...toPlain(d.data()) }));

export const reservationService = {
  async createReservation(uid, zoneId, slotId, reservationData) {
    try {
      const slotRef = doc(db, "parkingZones", zoneId, "slots", slotId);
      const slotDoc = await getDoc(slotRef);

      if (!slotDoc.exists())
        return { success: false, error: "Cupo no encontrado" };

      const slotBefore = slotDoc.data();

      if (slotBefore.status !== "available") {
        return {
          success: false,
          error: `Este espacio no está disponible (${slotBefore.status})`,
        };
      }

      const batch = writeBatch(db);
      const newDocRef = doc(collection(db, "reservations"));

      batch.set(newDocRef, {
        id: newDocRef.id,
        userId: uid,
        zoneId,
        slotId,
        zoneName: reservationData.zoneName || "",
        slotNumber: reservationData.slotNumber || "",
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        status: "reserved",
        price: reservationData.price,
        vehicleType: reservationData.vehicleType || "carro",
        notes: reservationData.notes || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.update(slotRef, {
        status: "reserved",
        reservedBy: uid,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      // Verificar estado del cupo DESPUÉS
      const slotAfterSnap = await getDoc(slotRef);
      const slotAfter = slotAfterSnap.data();

      return { success: true, reservationId: newDocRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserReservations(uid) {
    try {
      const snapshot = await getDocs(
        query(collection(db, "reservations"), where("userId", "==", uid)),
      );
      let reservations = mapDocs(snapshot);

      const getTime = (r) => {
        if (!r?.createdAt) return 0;
        if (typeof r.createdAt.toMillis === "function")
          return r.createdAt.toMillis();
        const t = new Date(r.createdAt).getTime();
        return isNaN(t) ? 0 : t;
      };
      reservations.sort((a, b) => getTime(b) - getTime(a));

      return { success: true, reservations };
    } catch (error) {
      console.error("getUserReservations:", error.message);
      return { success: false, error: error.message, reservations: [] };
    }
  },

  async getReservationById(reservationId) {
    try {
      const snap = await getDoc(doc(db, "reservations", reservationId));
      return snap.exists()
        ? {
            success: true,
            reservation: { id: snap.id, ...toPlain(snap.data()) },
          }
        : { success: false, error: "Reserva no encontrada" };
    } catch (error) {
      console.error("getReservationById:", error.message);
      return { success: false, error: error.message };
    }
  },

  async updateReservation(reservationId, updates) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("updateReservation:", error.message);
      return { success: false, error: error.message };
    }
  },

  async cancelReservation(reservationId) {
    try {
      const docRef = doc(db, "reservations", reservationId);
      const snap = await getDoc(docRef);

      if (!snap.exists())
        return { success: false, error: "Reserva no encontrada" };

      const reservationData = snap.data();

      if (reservationData.status !== "reserved") {
        return {
          success: false,
          error: "Solo puedes cancelar reservas pendientes",
        };
      }

      const { zoneId, slotId } = reservationData;

      // Verificar estado actual del cupo ANTES de actualizar
      const slotRef = doc(db, "parkingZones", zoneId, "slots", slotId);
      const slotSnap = await getDoc(slotRef);
      const slotBefore = slotSnap.data();

      // Actualizar reserva
      await updateDoc(docRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      // Actualizar cupo - LIBERAR
      await updateDoc(slotRef, {
        status: "available",
        reservedBy: null,
        updatedAt: serverTimestamp(),
      });

      // Verificar estado del cupo DESPUÉS de actualizar
      const slotAfterSnap = await getDoc(slotRef);
      const slotAfter = slotAfterSnap.data();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getZoneReservations(zoneId) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("zoneId", "==", zoneId),
          where("status", "==", "reserved"),
        ),
      );
      return { success: true, reservations: mapDocs(snapshot) };
    } catch (error) {
      console.error("getZoneReservations:", error.message);
      return { success: false, error: error.message, reservations: [] };
    }
  },

  async getActiveReservations(uid) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("userId", "==", uid),
          where("status", "in", ["reserved", "in_use"]),
        ),
      );
      let reservations = mapDocs(snapshot);
      const getTime = (r) => {
        if (!r?.startTime) return 0;
        if (typeof r.startTime.toMillis === "function")
          return r.startTime.toMillis();
        const t = new Date(r.startTime).getTime();
        return isNaN(t) ? 0 : t;
      };
      reservations.sort((a, b) => getTime(a) - getTime(b));
      return { success: true, reservations };
    } catch (error) {
      console.error("getActiveReservations:", error.message);
      return { success: false, error: error.message, reservations: [] };
    }
  },

  async getHistoricReservations(uid) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("userId", "==", uid),
          where("status", "in", ["completed", "cancelled"]),
        ),
      );
      let reservations = mapDocs(snapshot);
      const getTime = (r) => {
        if (!r?.updatedAt) return 0;
        if (typeof r.updatedAt.toMillis === "function")
          return r.updatedAt.toMillis();
        const t = new Date(r.updatedAt).getTime();
        return isNaN(t) ? 0 : t;
      };
      reservations.sort((a, b) => getTime(b) - getTime(a));
      return { success: true, reservations };
    } catch (error) {
      console.error("getHistoricReservations:", error.message);
      return { success: false, error: error.message, reservations: [] };
    }
  },

  async markReservationAsInUse(reservationId) {
    try {
      const docRef = doc(db, "reservations", reservationId);
      const snap = await getDoc(docRef);
      if (!snap.exists())
        return { success: false, error: "Reserva no encontrada" };

      await updateDoc(docRef, {
        status: "in_use",
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("markReservationAsInUse:", error.message);
      return { success: false, error: error.message };
    }
  },

  async completeReservation(reservationId) {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("completeReservation:", error.message);
      return { success: false, error: error.message };
    }
  },
};

export default reservationService;
