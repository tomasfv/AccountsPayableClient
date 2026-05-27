import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import billsReducer from './slices/billsSlice'
import vendorsReducer from './slices/vendorsSlice'
import cardsReducer from './slices/cardsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bills: billsReducer,
    vendors: vendorsReducer,
    cards: cardsReducer,
  },
})

// Inferred types for use throughout the app
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
