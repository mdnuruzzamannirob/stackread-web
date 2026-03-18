import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type BillingCycle = 'monthly' | 'yearly'

export type CheckoutState = {
  selectedPlan: string | null
  billingCycle: BillingCycle
  selectedGateway: string | null
  couponDraft: string
  lastPaymentIntentContext: Record<string, unknown> | null
}

const initialState: CheckoutState = {
  selectedPlan: null,
  billingCycle: 'monthly',
  selectedGateway: null,
  couponDraft: '',
  lastPaymentIntentContext: null,
}

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setSelectedPlan(state, action: PayloadAction<string | null>) {
      state.selectedPlan = action.payload
    },
    setBillingCycle(state, action: PayloadAction<BillingCycle>) {
      state.billingCycle = action.payload
    },
    setSelectedGateway(state, action: PayloadAction<string | null>) {
      state.selectedGateway = action.payload
    },
    setCouponDraft(state, action: PayloadAction<string>) {
      state.couponDraft = action.payload
    },
    setLastPaymentIntentContext(
      state,
      action: PayloadAction<Record<string, unknown> | null>,
    ) {
      state.lastPaymentIntentContext = action.payload
    },
    resetCheckoutState() {
      return initialState
    },
  },
})

export const {
  setSelectedPlan,
  setBillingCycle,
  setSelectedGateway,
  setCouponDraft,
  setLastPaymentIntentContext,
  resetCheckoutState,
} = checkoutSlice.actions

export const checkoutReducer = checkoutSlice.reducer
