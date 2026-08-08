export type BreathingModeId = "box" | "478" | "belly" | "sigh"

export interface BreathingModeOption {
  id: BreathingModeId
  label: string
  /** Short line under the title when this mode is selected */
  description: string
  ready: boolean
}
