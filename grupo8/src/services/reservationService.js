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
      if (slotDoc.data().status !== "available") {
        return {
          success: false,
          error: `Este espacio no está disponible (${slotDoc.data().status})`,
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
        status: "active",
        price: reservationData.price,
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

      return { success: true, reservationId: newDocRef.id };
    } catch (error) {
      console.error("createReservation:", error.message);
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

      const { zoneId, slotId } = snap.data();
      await updateDoc(docRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "parkingZones", zoneId, "slots", slotId), {
        status: "available",
        reservedBy: null,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("cancelReservation:", error.message);
      return { success: false, error: error.message };
    }
  },

  async getZoneReservations(zoneId) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "reservations"),
          where("zoneId", "==", zoneId),
          where("status", "==", "active"),
        ),
      );
      return { success: true, reservations: mapDocs(snapshot) };
    } catch (error) {
      console.error("getZoneReservations:", error.message);
      return { success: false, error: error.message, reservations: [] };
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
