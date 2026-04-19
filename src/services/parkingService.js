import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
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

export const parkingService = {
  async getParkingZones() {
    try {
      const snapshot = await getDocs(
        query(collection(db, "parkingZones"), orderBy("name")),
      );
      return { success: true, zones: mapDocs(snapshot) };
    } catch (error) {
      console.error("getParkingZones:", error.message);
      return { success: false, error: error.message, zones: [] };
    }
  },

  async getParkingZoneById(zoneId) {
    try {
      const snap = await getDoc(doc(db, "parkingZones", zoneId));
      return snap.exists()
        ? { success: true, zone: { id: snap.id, ...toPlain(snap.data()) } }
        : { success: false, error: "Zona no encontrada" };
    } catch (error) {
      console.error("getParkingZoneById:", error.message);
      return { success: false, error: error.message };
    }
  },

  async getParkingSlots(zoneId) {
    try {
      const slotsRef = collection(doc(db, "parkingZones", zoneId), "slots");
      const snapshot = await getDocs(query(slotsRef, orderBy("slotNumber")));
      return { success: true, slots: mapDocs(snapshot) };
    } catch (error) {
      console.error("getParkingSlots:", error.message);
      return { success: false, error: error.message, slots: [] };
    }
  },

  async getSlotById(zoneId, slotId) {
    try {
      const snap = await getDoc(
        doc(db, "parkingZones", zoneId, "slots", slotId),
      );
      return snap.exists()
        ? { success: true, slot: { id: snap.id, ...toPlain(snap.data()) } }
        : { success: false, error: "Cupo no encontrado" };
    } catch (error) {
      console.error("getSlotById:", error.message);
      return { success: false, error: error.message };
    }
  },

  async getParkingStatistics(zoneId) {
    try {
      const snap = await getDoc(doc(db, "parkingZones", zoneId));
      if (!snap.exists())
        return { success: false, error: "Zona no encontrada" };

      const data = snap.data();
      const total = data.totalSlots || 0;
      const occupied = data.occupiedSlots || 0;
      const reserved = data.reservedSlots || 0;
      const available = total - occupied - reserved;

      return {
        success: true,
        statistics: {
          totalSlots: total,
          occupiedSlots: occupied,
          reservedSlots: reserved,
          availableSlots: available,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
          availabilityRate:
            total > 0 ? Math.round((available / total) * 100) : 0,
        },
      };
    } catch (error) {
      console.error("getParkingStatistics:", error.message);
      return { success: false, error: error.message };
    }
  },

  async searchAvailableSlots(zoneId, slotType) {
    try {
      const slotsRef = collection(doc(db, "parkingZones", zoneId), "slots");
      const q = query(
        slotsRef,
        where("status", "==", "available"),
        where("type", "==", slotType),
      );
      const snapshot = await getDocs(q);
      return { success: true, slots: mapDocs(snapshot) };
    } catch (error) {
      console.error("searchAvailableSlots:", error.message);
      return { success: false, error: error.message, slots: [] };
    }
  },

  async updateSlotStatus(zoneId, slotId, status) {
    try {
      await updateDoc(doc(db, "parkingZones", zoneId, "slots", slotId), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error("updateSlotStatus:", error.message);
      return { success: false, error: error.message };
    }
  },

  async createSlot(zoneId, slotData) {
    try {
      const slotsRef = collection(doc(db, "parkingZones", zoneId), "slots");
      const docRef = await addDoc(slotsRef, {
        ...slotData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, slotId: docRef.id };
    } catch (error) {
      console.error("createSlot:", error.message);
      return { success: false, error: error.message };
    }
  },

  subscribeToSlots(zoneId, callback) {
    const slotsRef = collection(doc(db, "parkingZones", zoneId), "slots");
    return onSnapshot(
      slotsRef,
      (snapshot) => callback({ success: true, slots: mapDocs(snapshot) }),
      (error) => callback({ success: false, error: error.message }),
    );
  },
};

export default parkingService;
