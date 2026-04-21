import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const authErrorMsg = (code, fallback) => {
  const msgs = {
    "auth/email-already-in-use": "Este email ya está registrado",
    "auth/invalid-email": "Email inválido",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
    "auth/configuration-not-found": "Error de configuración de Firebase",
  };
  return msgs[code] || fallback || "Error desconocido";
};

export const registerUser = async (email, password, nombre, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "usuarios", uid), {
      uid,
      nombre,
      email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      phone: userData.phone || "",
      profilePicture: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });

    return { success: true, user: userCredential.user, uid };
  } catch (error) {
    console.error("registerUser:", error.code);
    return { success: false, error: authErrorMsg(error.code, error.message) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("loginUser:", error.code);
    return { success: false, error: authErrorMsg(error.code, error.message) };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, "usuarios", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
    };
  } catch (error) {
    console.error("getUserProfile:", error.message);
    return null;
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    await updateDoc(doc(db, "usuarios", uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("updateUserProfile:", error.message);
    return { success: false, error: error.message };
  }
};

export const onAuthStateChanged_Handler = (callback) => {
  return onAuthStateChanged(auth, callback);
};
