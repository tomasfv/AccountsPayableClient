import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../../services/api'
import type { Bill } from '../../types'

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
  async (payload: { vendorId: string; amount: number; invoiceNumber?: string; dueDate: string; file?: File }, { rejectWithValue }) => {
    try {
      let body
      if (payload.file) {
        const formData = new FormData()
        formData.append('vendorId', payload.vendorId)
        formData.append('amount', String(payload.amount))
        if (payload.invoiceNumber) formData.append('invoiceNumber', payload.invoiceNumber)
        formData.append('dueDate', payload.dueDate)
        formData.append('file', payload.file)
        body = formData
      } else {
        body = payload
      }
      const { data } = await api.post('/bills', body)
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

export const cancelPayment = createAsyncThunk(
  'bills/cancelPayment',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bills/${id}/cancel-payment`)
      return data.data.bill as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to cancel payment' : 'Failed to cancel payment')
    }
  }
)

export const reschedulePayment = createAsyncThunk(
  'bills/reschedulePayment',
  async (payload: { id: string; paymentMethod?: string; scheduledDate?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload
      const { data } = await api.post(`/bills/${id}/reschedule`, body)
      return data.data.bill as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to reschedule payment' : 'Failed to reschedule payment')
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

export const rejectBill = createAsyncThunk(
  'bills/reject',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/bills/${id}/reject`)
      return data.data as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to reject bill' : 'Failed to reject bill')
    }
  }
)

export const updateBill = createAsyncThunk(
  'bills/update',
  async (payload: { id: string; vendorId?: string; amount?: number; invoiceNumber?: string; dueDate?: string; file?: File }, { rejectWithValue }) => {
    try {
      let body
      if (payload.file) {
        const formData = new FormData()
        if (payload.vendorId !== undefined) formData.append('vendorId', payload.vendorId)
        if (payload.amount !== undefined) formData.append('amount', String(payload.amount))
        if (payload.invoiceNumber !== undefined) formData.append('invoiceNumber', payload.invoiceNumber)
        if (payload.dueDate !== undefined) formData.append('dueDate', payload.dueDate)
        formData.append('file', payload.file)
        body = formData
      } else {
        const { id, ...rest } = payload
        body = rest
      }
      const { data } = await api.put(`/bills/${payload.id}`, body)
      return data.data as Bill
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to update bill' : 'Failed to update bill')
    }
  }
)

export const deleteBill = createAsyncThunk(
  'bills/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/bills/${id}`)
      return id
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to delete bill' : 'Failed to delete bill')
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
      .addCase(reschedulePayment.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      .addCase(cancelPayment.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      // Reject
      .addCase(rejectBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      // Update
      .addCase(updateBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        const idx = state.items.findIndex((b) => b.id === action.payload.id)
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = { ...state.selected, ...action.payload }
        }
      })
      // Delete
      .addCase(deleteBill.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((b) => b.id !== action.payload)
        if (state.selected?.id === action.payload) {
          state.selected = null
        }
      })
  },
})

export const { clearSelected, clearError } = billsSlice.actions
export default billsSlice.reducer
