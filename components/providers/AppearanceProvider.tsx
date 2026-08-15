"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeType = "light" | "system" | "dark"
type TextSizeType = "small" | "medium" | "large"
type ContrastType = "standard" | "high"

interface AppearanceContextType {
  theme: ThemeType
  textSize: TextSizeType
  contrast: ContrastType
  setTheme: (t: ThemeType) => void
  setTextSize: (s: TextSizeType) => void
  setContrast: (c: ContrastType) => void
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

const STORAGE_KEY = "hey-attrangi-preferences"

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("system")
  const [textSize, setTextSizeState] = useState<TextSizeType>("medium")
  const [contrast, setContrastState] = useState<ContrastType>("standard")

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.theme) setThemeState(parsed.theme)
        if (parsed.textSize) setTextSizeState(parsed.textSize)
        if (parsed.contrast) setContrastState(parsed.contrast)
      }
    } catch (e) {
      console.warn("Failed to load appearance preferences", e)
    }
  }, [])

  // Apply changes to document.documentElement
  useEffect(() => {
    const root = document.documentElement

    // 1. Theme selection
    const applyTheme = (t: ThemeType) => {
      root.classList.remove("dark")
      if (t === "dark") {
        root.classList.add("dark")
      } else if (t === "system") {
        const isDarkSystem = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (isDarkSystem) root.classList.add("dark")
      }
    }

    applyTheme(theme)

    // Listen to system changes if theme is set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) => {
        root.classList.remove("dark")
        if (e.matches) root.classList.add("dark")
      }
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [theme])

  // Apply text size scale variable to document.documentElement
  useEffect(() => {
    const root = document.documentElement
    const scales = {
      small: "0.9",
      medium: "1.0",
      large: "1.15",
    }
    root.style.setProperty("--font-scale", scales[textSize])
  }, [textSize])

  // Apply contrast class to document.documentElement
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("high-contrast")
    if (contrast === "high") {
      root.classList.add("high-contrast")
    }
  }, [contrast])

  // Persist preferences to localStorage when they change
  const setTheme = (t: ThemeType) => {
    setThemeState(t)
    save({ theme: t, textSize, contrast })
  }

  const setTextSize = (s: TextSizeType) => {
    setTextSizeState(s)
    save({ theme, textSize: s, contrast })
  }

  const setContrast = (c: ContrastType) => {
    setContrastState(c)
    save({ theme, textSize, contrast: c })
  }

  const save = (data: { theme: ThemeType; textSize: TextSizeType; contrast: ContrastType }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn("Failed to save appearance preferences", e)
    }
  }

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        textSize,
        contrast,
        setTheme,
        setTextSize,
        setContrast,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider")
  }
  return context
}
