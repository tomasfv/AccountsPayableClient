import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../../services/api'

// --- Types ---
export interface Payment {
  id: string
  billId: string
  paymentMethod: 'ACH' | 'Paper Check' | 'Card'
  amount: number
  scheduledDate: string
  paidDate: string | null
  status: 'Not Scheduled' | 'Scheduled' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded'
  transactionReference: string | null
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  email: string
}

export interface Bill {
  id: string
  vendorId: string
  createdById: string
  approvedById: string | null
  amount: number
  invoiceNumber: string | null
  dueDate: string
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Overdue' | 'Rejected' | 'Cancelled' | 'Paid'
  vendor?: Vendor
  creator?: { id: string; fullName: string; email: string }
  approver?: { id: string; fullName: string; email: string } | null
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

interface BillsState {
  items: Bill[]
  selected: Bill | null
  loading: boolean
  submitting: boolean
  error: string | null
}

// --- Thunks ---
export const fetchBills = createAsyncThunk(
  'bills/fetchAll',
  async (status: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {}
      const { data } = await api.get('/bills', { params })
      return data.data as Bill[]
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to fetch bills' : 'Failed to fetch bills')
    }
  }
)

export const fetchBillById = createAsyncThunk(
  'bills/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/bills/${id}`)
      return data.data as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to fetch bill' : 'Failed to fetch bill')
    }
  }
)

export const createBill = createAsyncThunk(
  'bills/create',
  async (payload: { vendorId: string; amount: number; invoiceNumber?: string; dueDate: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bills', payload)
      return data.data as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to create bill' : 'Failed to create bill')
    }
  }
)

export const approveBill = createAsyncThunk(
  'bills/approve',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bills/${id}/approve`)
      return data.data as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to approve bill' : 'Failed to approve bill')
    }
  }
)

export const schedulePayment = createAsyncThunk(
  'bills/schedulePayment',
  async (payload: { id: string; paymentMethod?: string; scheduledDate?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload
      const { data } = await api.post(`/bills/${id}/schedule`, body)
      return data.data.bill as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to schedule payment' : 'Failed to schedule payment')
    }
  }
)

export const executePayment = createAsyncThunk(
  'bills/executePayment',
  async (payload: { id: string; paymentMethod?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload
      const { data } = await api.post(`/bills/${id}/pay`, body)
      return data.data.bill as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to execute payment' : 'Failed to execute payment')
    }
  }
)

// --- Initial State ---
const initialState: BillsState = {
  items: [],
  selected: null,
  loading: false,
  submitting: false,
  error: null,
}

// --- Helper to upsert a bill in the list ---
const upsertBill = (items: Bill[], updated: Bill): Bill[] => {
  const idx = items.findIndex((b) => b.id === updated.id)
  if (idx >= 0) {
    const next = [...items]
    next[idx] = updated
    return next
  }
  return [updated, ...items]
}

// --- Slice ---
const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBills.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBills.fulfilled, (state, action: PayloadAction<Bill[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch By Id
      .addCase(fetchBillById.pending, (state) => { state.loading = true })
      .addCase(fetchBillById.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Create
      .addCase(createBill.pending, (state) => { state.submitting = true; state.error = null })
      .addCase(createBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.submitting = false
        state.items = upsertBill(state.items, action.payload)
      })
      .addCase(createBill.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      // Approve / Schedule / Pay — merge into existing bill to preserve associations
      .addCase(approveBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      .addCase(schedulePayment.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      .addCase(executePayment.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
  },
})

export const { clearSelected, clearError } = billsSlice.actions
export default billsSlice.reducer
