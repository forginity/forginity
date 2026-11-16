import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UserProfile } from "@forginity/sdk/modules/auth/auth.types"

export interface UserState {
  user: UserProfile | null
  isAuthenticated: boolean
  status: "idle" | "loading" | "authenticated" | "unauthenticated"
  error: string | null
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.status = "authenticated"
      state.error = null
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("admin_user", JSON.stringify(action.payload))
        } catch {
          // Ignore localStorage quota or private mode errors
        }
      }
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.status = "unauthenticated"
      state.error = null
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("admin_user")
        } catch {
          // Ignore localStorage errors
        }
      }
    },
    setAuthStatus: (
      state,
      action: PayloadAction<UserState["status"]>
    ) => {
      state.status = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthStatus, setError } = userSlice.actions
export const userReducer = userSlice.reducer
