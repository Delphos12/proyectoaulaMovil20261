import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    combineReducers,
    configureStore,
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { parkingService } from "./services/parkingService";
import { reservationService } from "./services/reservationService";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    logoutDone(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const fetchZones = createAsyncThunk(
  "parking/fetchZones",
  async (_, { rejectWithValue }) => {
    const result = await parkingService.getParkingZones();
    return result.success ? result.zones : rejectWithValue(result.error);
  },
);

export const fetchSlots = createAsyncThunk(
  "parking/fetchSlots",
  async (zoneId, { rejectWithValue }) => {
    const result = await parkingService.getParkingSlots(zoneId);
    return result.success ? result.slots : rejectWithValue(result.error);
  },
);

const parkingSlice = createSlice({
  name: "parking",
  initialState: { zones: [], selectedSlots: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchZones.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.zones = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSlots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSlots.fulfilled, (state, action) => {
        state.selectedSlots = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const fetchReservations = createAsyncThunk(
  "reservation/fetch",
  async (userId, { rejectWithValue }) => {
    const result = await reservationService.getUserReservations(userId);
    return result.success ? result.reservations : rejectWithValue(result.error);
  },
);

export const createReservationThunk = createAsyncThunk(
  "reservation/create",
  async (data, { rejectWithValue, dispatch }) => {
    const { userId, zoneId, slotId, ...rest } = data;
    const result = await reservationService.createReservation(
      userId,
      zoneId,
      slotId,
      rest,
    );
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    dispatch(fetchReservations(userId));
    return result.reservationId;
  },
);

export const cancelReservationThunk = createAsyncThunk(
  "reservation/cancel",
  async ({ reservationId, userId }, { rejectWithValue, dispatch }) => {
    const result = await reservationService.cancelReservation(reservationId);
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    if (userId) dispatch(fetchReservations(userId));
    return reservationId;
  },
);

export const fetchActiveReservations = createAsyncThunk(
  "reservation/fetchActive",
  async (userId, { rejectWithValue }) => {
    const result = await reservationService.getActiveReservations(userId);
    return result.success ? result.reservations : rejectWithValue(result.error);
  },
);

export const fetchHistoricReservations = createAsyncThunk(
  "reservation/fetchHistoric",
  async (userId, { rejectWithValue }) => {
    const result = await reservationService.getHistoricReservations(userId);
    return result.success ? result.reservations : rejectWithValue(result.error);
  },
);

export const markReservationAsInUseThunk = createAsyncThunk(
  "reservation/markInUse",
  async ({ reservationId, userId }, { rejectWithValue, dispatch }) => {
    const result =
      await reservationService.markReservationAsInUse(reservationId);
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    if (userId) dispatch(fetchReservations(userId));
    return reservationId;
  },
);

export const completeReservationThunk = createAsyncThunk(
  "reservation/complete",
  async ({ reservationId, userId }, { rejectWithValue, dispatch }) => {
    const result = await reservationService.completeReservation(reservationId);
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    if (userId) dispatch(fetchReservations(userId));
    return reservationId;
  },
);

const reservationSlice = createSlice({
  name: "reservation",
  initialState: {
    reservations: [],
    isLoading: false,
    isCreating: false,
    isCancelling: false,
    isMarkingInUse: false,
    isCompleting: false,
    error: null,
    createError: null,
    cancelError: null,
    markInUseError: null,
    completeError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(createReservationThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createReservationThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createError = null;
      })
      .addCase(createReservationThunk.rejected, (state, action) => {
        state.createError = action.payload;
        state.isCreating = false;
      })
      .addCase(cancelReservationThunk.pending, (state) => {
        state.isCancelling = true;
        state.cancelError = null;
      })
      .addCase(cancelReservationThunk.fulfilled, (state, action) => {
        // NO eliminar - solo actualizar el estado a "cancelled"
        const reservation = state.reservations.find(
          (r) => r.id === action.payload,
        );
        if (reservation) {
          reservation.status = "cancelled";
        }
        state.isCancelling = false;
        state.cancelError = null;
      })
      .addCase(cancelReservationThunk.rejected, (state, action) => {
        state.cancelError = action.payload;
        state.isCancelling = false;
      })
      .addCase(markReservationAsInUseThunk.pending, (state) => {
        state.isMarkingInUse = true;
        state.markInUseError = null;
      })
      .addCase(markReservationAsInUseThunk.fulfilled, (state, action) => {
        const reservation = state.reservations.find(
          (r) => r.id === action.payload,
        );
        if (reservation) {
          reservation.status = "in_use";
        }
        state.isMarkingInUse = false;
        state.markInUseError = null;
      })
      .addCase(markReservationAsInUseThunk.rejected, (state, action) => {
        state.markInUseError = action.payload;
        state.isMarkingInUse = false;
      })
      .addCase(completeReservationThunk.pending, (state) => {
        state.isCompleting = true;
        state.completeError = null;
      })
      .addCase(completeReservationThunk.fulfilled, (state, action) => {
        const reservation = state.reservations.find(
          (r) => r.id === action.payload,
        );
        if (reservation) {
          reservation.status = "completed";
        }
        state.isCompleting = false;
        state.completeError = null;
      })
      .addCase(completeReservationThunk.rejected, (state, action) => {
        state.completeError = action.payload;
        state.isCompleting = false;
      });
  },
});

const themeSlice = createSlice({
  name: "theme",
  initialState: { isDarkMode: false },
  reducers: {
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode(state, action) {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "theme"],
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  parking: parkingSlice.reducer,
  reservation: reservationSlice.reducer,
  theme: themeSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export const { setUser, clearUser, setLoading, logoutDone } = authSlice.actions;
