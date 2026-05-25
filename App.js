import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { StatusBar } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { LoadingSpinner } from "./src/components";
import "./src/config/firebase";
import { COLORS_DARK, COLORS_LIGHT } from "./src/constants";
import Navigation from "./src/navigation";
import {
    getUserProfile,
    onAuthStateChanged_Handler,
} from "./src/services/authService";
import { clearUser, persistor, setLoading, setUser, store } from "./src/store";

function AppContent() {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);
  const colors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;
  const lastUidRef = useRef(null);

  useEffect(() => {
    dispatch(setLoading(true));
    const unsubscribe = onAuthStateChanged_Handler(async (user) => {
      if (user) {
        if (lastUidRef.current === user.uid) return;
        lastUidRef.current = user.uid;
        const profile = await getUserProfile(user.uid);
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            nombre: profile?.nombre || "",
            ...profile,
          }),
        );
      } else {
        lastUidRef.current = null;
        dispatch(clearUser());
      }
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner visible />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
