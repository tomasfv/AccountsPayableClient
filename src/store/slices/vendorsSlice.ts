import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../../services/api'
import type { Vendor } from '../../types'

interface VendorsState {
  items: Vendor[]
  selected: Vendor | null
  loading: boolean
  submitting: boolean
  error: string | null
}

// --- Thunks ---
export const fetchVendors = createAsyncThunk(
  'vendors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/vendors')
      return data.data as Vendor[]
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to fetch vendors' : 'Failed to fetch vendors')
    }
  }
)

export const createVendor = createAsyncThunk(
  'vendors/create',
  async (payload: Partial<Vendor>, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/vendors', payload)
      return data.data as Vendor
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to create vendor' : 'Failed to create vendor')
    }
  }
)

export const updateVendor = createAsyncThunk(
  'vendors/update',
  async ({ id, ...payload }: Partial<Vendor> & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/vendors/${id}`, payload)
      return data.data as Vendor
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to update vendor' : 'Failed to update vendor')
    }
  }
)

// --- Initial State ---
const initialState: VendorsState = {
  items: [],
  selected: null,
  loading: false,
  submitting: false,
  error: null,
}

// --- Slice ---
const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setSelected(state, action: PayloadAction<Vendor | null>) {
      state.selected = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchVendors.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createVendor.pending, (state) => { state.submitting = true })
      .addCase(createVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.submitting = false
        state.items = [action.payload, ...state.items]
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(updateVendor.pending, (state) => { state.submitting = true })
      .addCase(updateVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.submitting = false
        const idx = state.items.findIndex((v) => v.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { setSelected, clearError } = vendorsSlice.actions
export default vendorsSlice.reducer
