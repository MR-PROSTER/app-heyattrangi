import type { Metadata } from "next"
import BoxBreathingExperience from "@/components/box-breathing/BoxBreathingExperience"

export const metadata: Metadata = {
  title: "Box Breathing | Hey Attrangi",
  description: "A guided box breathing exercise to help you find calm in minutes.",
}

export default function BoxBreathingPage() {
  return <BoxBreathingExperience />
}
