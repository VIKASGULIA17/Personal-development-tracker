import type { Metadata } from "next"
import SchedulePage from "@/components/SchedulePage"

export const metadata: Metadata = {
  title: "Schedule | Life Tracker",
  description: "Plan and track your weekly schedule with time-based notifications and real-time updates",
}

export default function Schedule() {
  return <SchedulePage />
}
