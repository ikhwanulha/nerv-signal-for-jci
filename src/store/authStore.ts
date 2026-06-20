import { create } from "zustand"

interface AuthUIState {
  isGoogleLoading: boolean
  error: string | null
  theme: "dark" | "green" | "amber" | "blue"
  setGoogleLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  setTheme: (theme: AuthUIState["theme"]) => void
}

const getStoredTheme = (): AuthUIState["theme"] => {
  if (typeof window === "undefined") return "dark"
  try {
    const stored = localStorage.getItem("nerv-signal-theme")
    if (stored === "dark" || stored === "green" || stored === "amber" || stored === "blue") {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  return "dark"
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  isGoogleLoading: false,
  error: null,
  theme: getStoredTheme(),
  setGoogleLoading: (loading) => set({ isGoogleLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nerv-signal-theme", theme)
      } catch {
        // silent
      }
    }
    set({ theme })
  },
}))
