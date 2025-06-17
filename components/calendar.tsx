"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getDailySummaries } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function Calendar() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeDays, setActiveDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveDays() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get first and last day of current month
          const year = currentMonth.getFullYear()
          const month = currentMonth.getMonth()
          const firstDay = new Date(year, month, 1)
          const lastDay = new Date(year, month + 1, 0)

          const formattedFirstDay = firstDay.toISOString().split("T")[0]
          const formattedLastDay = lastDay.toISOString().split("T")[0]

          const summaries = await getDailySummaries(user.id, formattedFirstDay, formattedLastDay)

          // Extract days with activity
          const days = summaries.map((summary) => new Date(summary.date).getDate())
          setActiveDays(days)
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveDays()
  }, [currentMonth])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDayClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    router.push(`/daily/${formattedDate}`)
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth())

    const days = []
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Render weekday headers
    weekdays.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="text-center text-xs font-medium text-muted-foreground p-2">
          {day}
        </div>,
      )
    })

    // Empty cells for days of previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear()

      const hasActivity = activeDays.includes(day)

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={cn(
            "text-center p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center cursor-pointer hover:bg-accent relative",
            isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
            !isToday && hasActivity && "font-medium",
          )}
        >
          {day}
          {hasActivity && !isToday && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>}
        </div>,
      )
    }

    return days
  }

  if (loading) {
    return <CalendarSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">
          {currentMonth.toLocaleDateString("default", { month: "long", year: "numeric" })}
        </h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 relative">{renderCalendar()}</div>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(7)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-6 w-full" />
          ))}
        {Array(35)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`day-${i}`} className="h-10 w-10 rounded-full mx-auto" />
          ))}
      </div>
    </div>
  )
}
