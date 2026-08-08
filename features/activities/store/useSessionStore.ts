"use client"

import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"
import type {
  BodyRegion,
  MovementLevel,
  ScanAnchor,
  ScanEyes,
  Sense,
  SensePreference,
  SessionRecord,
} from "../types"
import { DEFAULT_GROUNDING_SENSES } from "../data/groundingSteps"

export type BellyPaceId = "gentle" | "standard" | "deep"

const BODY_REGIONS: BodyRegion[] = [
  "jaw",
  "shoulders",
  "hands",
  "neck",
  "feet",
  "ankles",
  "spine",
  "whole",
  "tongue",
  "brows",
]

function defaultMovementLevel(): Record<BodyRegion, MovementLevel> {
  return {
    jaw: "standard",
    shoulders: "standard",
    hands: "standard",
    neck: "standard",
    feet: "standard",
    ankles: "standard",
    spine: "standard",
    whole: "standard",
    tongue: "standard",
    brows: "standard",
  }
}

interface SessionPrefs {
  sound: boolean
  haptics: boolean
  defaultCycles: number
  exhaleGuide: boolean
  bellyPace?: BellyPaceId
  bellyTeachingSeen?: boolean
  bellyGuideTone?: boolean
  sighSound?: boolean
  lastSupportNudgeAt?: string | null
  groundingSenses?: Record<Sense, SensePreference>
  movementLevel?: Record<BodyRegion, MovementLevel>
  discreetMode?: boolean
  eyesClosedMode?: boolean
  autoAdvance?: boolean
  scanEyes?: ScanEyes
  scanAnchor?: ScanAnchor
  scanSkipRegions?: string[]
  scanAmbience?: boolean
  voiceGuide?: boolean
  natureSound?: string
  boxBreathSeconds?: number
  boxVoiceGuide?: boolean
  boxVoiceRate?: number
  boxVoiceVolume?: number
  boxVoiceURI?: string | null
}

interface SessionStore {
  history: SessionRecord[]
  prefs: SessionPrefs
  _hasHydrated: boolean
  sessionActive: boolean
  setHasHydrated: (v: boolean) => void
  setSessionActive: (v: boolean) => void
  addSession: (r: Omit<SessionRecord, "id">) => void
  setPref: <K extends keyof SessionPrefs>(k: K, v: SessionPrefs[K]) => void
  setGroundingSense: (sense: Sense, pref: SensePreference) => void
  setMovementLevel: (region: BodyRegion, level: MovementLevel) => void
  attachGroundingEntriesToLatest: (
    entries: readonly { sense: Sense; text: string }[]
  ) => void
  deleteAllGroundingEntries: () => void
  currentStreak: () => number
  hasCompletedActivity: (slug: string) => boolean
  countSessionsSince: (slug: string, sinceMs: number) => number
}

const MAX_HISTORY = 200

const DEFAULT_PREFS: SessionPrefs = {
  sound: true,
  haptics: true,
  defaultCycles: 8,
  exhaleGuide: false,
  bellyPace: "standard",
  bellyTeachingSeen: false,
  bellyGuideTone: false,
  sighSound: true,
  lastSupportNudgeAt: null,
  groundingSenses: { ...DEFAULT_GROUNDING_SENSES },
  movementLevel: defaultMovementLevel(),
  discreetMode: false,
  eyesClosedMode: false,
  autoAdvance: false,
  scanEyes: "closed",
  scanAnchor: "hands",
  scanSkipRegions: [],
  scanAmbience: false,
  voiceGuide: false,
  natureSound: "off",
  boxBreathSeconds: 4,
  boxVoiceGuide: false,
  boxVoiceRate: 0.92,
  boxVoiceVolume: 0.85,
  boxVoiceURI: null,
}

function normalizeBellyPace(raw: unknown): BellyPaceId {
  if (raw === "gentle" || raw === "standard" || raw === "deep") return raw
  return "standard"
}

function normalizeGroundingSenses(
  raw: unknown
): Record<Sense, SensePreference> {
  const base = { ...DEFAULT_GROUNDING_SENSES }
  if (!raw || typeof raw !== "object") return base
  const o = raw as Record<string, unknown>
  for (const sense of Object.keys(base) as Sense[]) {
    const v = o[sense]
    if (v === "default" || v === "substitute" || v === "skip") {
      base[sense] = v
    }
  }
  return base
}

function normalizeMovementLevel(
  raw: unknown
): Record<BodyRegion, MovementLevel> {
  const base = defaultMovementLevel()
  if (!raw || typeof raw !== "object") return base
  const o = raw as Record<string, unknown>
  for (const region of BODY_REGIONS) {
    const v = o[region]
    if (
      v === "standard" ||
      v === "gentler" ||
      v === "imagined" ||
      v === "skip"
    ) {
      base[region] = v
    }
  }
  return base
}

function createSafeStorage(): StateStorage {
  const memory = new Map<string, string>()
  return {
    getItem: (name) => {
      try {
        if (typeof window === "undefined") return memory.get(name) ?? null
        return window.localStorage.getItem(name) ?? memory.get(name) ?? null
      } catch {
        return memory.get(name) ?? null
      }
    },
    setItem: (name, value) => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(name, value)
        }
      } catch {
        // Safari private mode — keep in memory
      }
      memory.set(name, value)
    },
    removeItem: (name) => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(name)
        }
      } catch {
        // ignore
      }
      memory.delete(name)
    },
  }
}

function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function computeStreak(history: SessionRecord[]): number {
  if (history.length === 0) return 0
  const days = new Set(
    history.map((s) => localDayKey(new Date(s.startedAt)))
  )
  let streak = 0
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  if (!days.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(localDayKey(cursor))) return 0
  }
  while (days.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function normalizeHistory(raw: unknown): SessionRecord[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((r): r is SessionRecord => !!r && typeof r === "object")
    .map((r) => ({
      ...r,
      endedEarly: r.endedEarly ?? false,
      kind: r.kind ?? "paced",
      stepsCompleted: r.stepsCompleted,
      groundingEntries: r.groundingEntries,
    }))
    .slice(0, MAX_HISTORY)
}

function slugMatch(activitySlug: string, slug: string): boolean {
  return (
    activitySlug === slug ||
    (slug === "breathing-4-7-8" && activitySlug === "478") ||
    (slug === "478" && activitySlug === "breathing-4-7-8") ||
    (slug === "belly" && activitySlug === "belly-breathing") ||
    (slug === "belly-breathing" && activitySlug === "belly") ||
    (slug === "physiological-sigh" && activitySlug === "sigh") ||
    (slug === "sigh" && activitySlug === "physiological-sigh")
  )
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      history: [],
      prefs: { ...DEFAULT_PREFS, movementLevel: defaultMovementLevel() },
      _hasHydrated: false,
      sessionActive: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setSessionActive: (v) => set({ sessionActive: v }),
      addSession: (r) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        set((state) => ({
          history: [
            { ...r, id, kind: r.kind ?? "paced" },
            ...state.history,
          ].slice(0, MAX_HISTORY),
        }))
      },
      setPref: (k, v) =>
        set((state) => ({
          prefs: { ...state.prefs, [k]: v },
        })),
      setGroundingSense: (sense, pref) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            groundingSenses: {
              ...(state.prefs.groundingSenses ?? DEFAULT_GROUNDING_SENSES),
              [sense]: pref,
            },
          },
        })),
      setMovementLevel: (region, level) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            movementLevel: {
              ...(state.prefs.movementLevel ?? defaultMovementLevel()),
              [region]: level,
            },
          },
        })),
      attachGroundingEntriesToLatest: (entries) =>
        set((state) => {
          const idx = state.history.findIndex(
            (h) =>
              h.activitySlug === "5-4-3-2-1-grounding" ||
              h.activitySlug === "grounding-54321"
          )
          if (idx < 0) return state
          const next = [...state.history]
          next[idx] = { ...next[idx], groundingEntries: entries }
          return { history: next }
        }),
      deleteAllGroundingEntries: () =>
        set((state) => ({
          history: state.history.map((h) =>
            h.groundingEntries
              ? { ...h, groundingEntries: undefined }
              : h
          ),
        })),
      currentStreak: () => computeStreak(get().history),
      hasCompletedActivity: (slug) =>
        get().history.some((s) => s.completed && slugMatch(s.activitySlug, slug)),
      countSessionsSince: (slug, sinceMs) =>
        get().history.filter(
          (s) =>
            slugMatch(s.activitySlug, slug) &&
            new Date(s.startedAt).getTime() >= sinceMs
        ).length,
    }),
    {
      name: "hey-attrangi-activity-sessions",
      version: 9,
      storage: createJSONStorage(() => createSafeStorage()),
      skipHydration: true,
      partialize: (state) => ({
        history: state.history,
        prefs: state.prefs,
      }),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") {
          return { history: [], prefs: { ...DEFAULT_PREFS, movementLevel: defaultMovementLevel() } }
        }
        const p = persisted as {
          history?: unknown
          prefs?: Partial<SessionPrefs> & Record<string, unknown>
        }
        const history = normalizeHistory(p.history)
        const prefs: SessionPrefs = {
          sound: p.prefs?.sound ?? true,
          haptics: p.prefs?.haptics ?? true,
          defaultCycles: p.prefs?.defaultCycles ?? 8,
          exhaleGuide:
            version < 2 ? false : (p.prefs?.exhaleGuide ?? false),
          bellyPace:
            version < 3
              ? "standard"
              : normalizeBellyPace(p.prefs?.bellyPace),
          bellyTeachingSeen:
            version < 3 ? false : Boolean(p.prefs?.bellyTeachingSeen),
          bellyGuideTone:
            version < 3 ? false : Boolean(p.prefs?.bellyGuideTone),
          sighSound:
            version < 4 ? true : (p.prefs?.sighSound ?? true),
          lastSupportNudgeAt:
            version < 4
              ? null
              : typeof p.prefs?.lastSupportNudgeAt === "string"
                ? p.prefs.lastSupportNudgeAt
                : null,
          groundingSenses:
            version < 5
              ? { ...DEFAULT_GROUNDING_SENSES }
              : normalizeGroundingSenses(p.prefs?.groundingSenses),
          movementLevel:
            version < 6
              ? defaultMovementLevel()
              : normalizeMovementLevel(p.prefs?.movementLevel),
          discreetMode:
            version < 6 ? false : Boolean(p.prefs?.discreetMode),
          eyesClosedMode:
            version < 6 ? false : Boolean(p.prefs?.eyesClosedMode),
          autoAdvance:
            version < 6 ? false : Boolean(p.prefs?.autoAdvance),
          scanEyes:
            version < 7
              ? "closed"
              : p.prefs?.scanEyes === "open"
                ? "open"
                : "closed",
          scanAnchor:
            version < 7
              ? "hands"
              : p.prefs?.scanAnchor === "feet" ||
                  p.prefs?.scanAnchor === "breath" ||
                  p.prefs?.scanAnchor === "sound"
                ? p.prefs.scanAnchor
                : "hands",
          scanSkipRegions:
            version < 7
              ? []
              : Array.isArray(p.prefs?.scanSkipRegions)
                ? (p.prefs.scanSkipRegions as string[]).filter(
                    (x) => typeof x === "string"
                  )
                : [],
          scanAmbience:
            version < 7 ? false : Boolean(p.prefs?.scanAmbience),
          voiceGuide:
            version < 8 ? false : Boolean(p.prefs?.voiceGuide),
          natureSound:
            version < 8
              ? "off"
              : typeof p.prefs?.natureSound === "string" &&
                  ["off", "rain", "forest", "ocean", "wind"].includes(
                    p.prefs.natureSound
                  )
                ? p.prefs.natureSound
                : "off",
          boxBreathSeconds:
            version < 9
              ? 4
              : typeof p.prefs?.boxBreathSeconds === "number" &&
                  p.prefs.boxBreathSeconds >= 3 &&
                  p.prefs.boxBreathSeconds <= 6
                ? Math.round(p.prefs.boxBreathSeconds)
                : 4,
          boxVoiceGuide:
            version < 9 ? false : Boolean(p.prefs?.boxVoiceGuide),
          boxVoiceRate:
            version < 9
              ? 0.92
              : typeof p.prefs?.boxVoiceRate === "number"
                ? Math.min(1.1, Math.max(0.7, p.prefs.boxVoiceRate))
                : 0.92,
          boxVoiceVolume:
            version < 9
              ? 0.85
              : typeof p.prefs?.boxVoiceVolume === "number"
                ? Math.min(1, Math.max(0.3, p.prefs.boxVoiceVolume))
                : 0.85,
          boxVoiceURI:
            version < 9
              ? null
              : typeof p.prefs?.boxVoiceURI === "string"
                ? p.prefs.boxVoiceURI
                : null,
        }
        return { history, prefs }
      },
    }
  )
)
