import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0

  // Sort dates in descending order
  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a))

  // Get today's date without time component
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Convert dates to day values for comparison
  const dateValues = sortedDates.map((date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  })

  // Check if the streak includes today
  let currentStreak = 0
  const currentDate = today

  while (dateValues.includes(currentDate.getTime())) {
    currentStreak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return currentStreak
}

export function getProgressColor(percentage) {
  if (percentage < 30) return "bg-red-500"
  if (percentage < 70) return "bg-yellow-500"
  return "bg-green-500"
}
