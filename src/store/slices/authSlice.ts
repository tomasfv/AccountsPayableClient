import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { isAxiosError } from 'axios'
import api from '../../services/api'
import type { User } from '../../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  users: User[]
}

// --- Thunks ---
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('token', data.token)
      return data
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Login failed' : 'Login failed')
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me')
      return data.data
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Session expired' : 'Session expired')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/users')
      return data.data as User[]
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to fetch users' : 'Failed to fetch users')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: { email: string; password: string; fullName: string; role: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload)
      return data.data as User
    } catch (err: unknown) {
      return rejectWithValue(isAxiosError(err) ? err.response?.data?.message || 'Failed to register user' : 'Failed to register user')
    }
  }
)

// --- Initial State ---
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  users: [],
}

// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.users = []
      localStorage.removeItem('token')
    },
    clearError(state) {
      state.error = null
    },
    setDeveloperRole(state, action: PayloadAction<'Admin' | 'Approver' | 'Submitter'>) {
      if (state.user) {
        state.user.role = action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; data: User }>) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.data
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Me
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.users = [...state.users, action.payload]
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError, setDeveloperRole } = authSlice.actions
export default authSlice.reducer
