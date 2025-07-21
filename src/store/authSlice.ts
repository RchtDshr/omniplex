import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface AuthState {
  authState: boolean;
  userDetails: {
    uid: string;
    name: string;
    email: string;
    profilePic: string;
  };
  subscription: {
    isActive: boolean;
    plan: 'free' | 'pro';
    subscriptionId: string | null;
    currentPeriodEnd: number | null;
  };
}

const initialState: AuthState = {
  authState: false,
  userDetails: {
    uid: "",
    name: "",
    email: "",
    profilePic: "",
  },
  subscription: {
    isActive: false,
    plan: 'free',
    subscriptionId: null,
    currentPeriodEnd: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.authState = action.payload;
    },
    setUserDetailsState: (
      state,
      action: PayloadAction<{
        uid: string;
        name: string;
        email: string;
        profilePic: string;
      }>
    ) => {
      state.userDetails = action.payload;
    },
    setSubscriptionState: (
      state,
      action: PayloadAction<{
        isActive: boolean;
        plan: 'free' | 'pro';
        subscriptionId: string | null;
        currentPeriodEnd: number | null;
      }>
    ) => {
      state.subscription = action.payload;
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

export const { setAuthState, setUserDetailsState, setSubscriptionState, resetAuth } =
  authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth.authState;
export const selectUserDetailsState = (state: RootState) =>
  state.auth.userDetails;
export const selectSubscriptionState = (state: RootState) =>
  state.auth.subscription;

export default authSlice.reducer;
