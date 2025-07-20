import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSubscription } from '@/utils/types';

interface SubscriptionState {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<UserSubscription | null>) => {
      state.subscription = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setSubscription, setLoading, setError, clearError } = subscriptionSlice.actions;

export const selectSubscription = (state: { subscription: SubscriptionState }) =>
  state.subscription.subscription;
export const selectSubscriptionLoading = (state: { subscription: SubscriptionState }) =>
  state.subscription.loading;
export const selectSubscriptionError = (state: { subscription: SubscriptionState }) =>
  state.subscription.error;

export default subscriptionSlice.reducer;
