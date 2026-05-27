import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../../services/api'
import type { Card } from '../../types'

interface CardsState {
  items: Card[]
  loading: boolean
  submitting: boolean
  error: string | null
}

export const fetchCards = createAsyncThunk(
  'cards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/cards')
      return data.data as Card[]
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to fetch cards' : 'Failed to fetch cards')
    }
  }
)

export const createCard = createAsyncThunk(
  'cards/create',
  async (payload: { type: 'Debit' | 'Credit'; cardholderName: string; cardNumber: string; expiryMonth: string; expiryYear: string; cvv: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/cards', payload)
      return data.data as Card
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to create card' : 'Failed to create card')
    }
  }
)

export const updateCard = createAsyncThunk(
  'cards/update',
  async (payload: { id: string; cardholderName?: string; cardNumber?: string; expiryMonth?: string; expiryYear?: string; cvv?: string }, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload
      const { data } = await api.put(`/cards/${id}`, body)
      return data.data as Card
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to update card' : 'Failed to update card')
    }
  }
)

export const deleteCard = createAsyncThunk(
  'cards/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cards/${id}`)
      return id
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to delete card' : 'Failed to delete card')
    }
  }
)

const initialState: CardsState = {
  items: [],
  loading: false,
  submitting: false,
  error: null,
}

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCards.fulfilled, (state, action: PayloadAction<Card[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(createCard.pending, (state) => { state.submitting = true })
      .addCase(createCard.fulfilled, (state, action: PayloadAction<Card>) => {
        state.submitting = false
        state.items = [...state.items, action.payload]
      })
      .addCase(createCard.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(updateCard.pending, (state) => { state.submitting = true })
      .addCase(updateCard.fulfilled, (state, action: PayloadAction<Card>) => {
        state.submitting = false
        const idx = state.items.findIndex((c) => c.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
      .addCase(deleteCard.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
      })
  },
})

export const { clearError } = cardsSlice.actions
export default cardsSlice.reducer
