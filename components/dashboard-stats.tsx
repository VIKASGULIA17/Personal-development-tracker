"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Target, TrendingUp, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getTasks, getExercises, getDisciplineEntries } from "@/lib/db"

export default function DashboardStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    completedToday: 0,
    totalGoals: 0,
    currentStreak: 0,
    activeDays: 0,
  })

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const [tasks, exercises, discipline] = await Promise.all([
        getTasks(user.id),
        getExercises(user.id),
        getDisciplineEntries(user.id),
      ])

      const todayTasks = tasks.filter((t) => t.created_at.split("T")[0] === today)
      const todayExercises = exercises.filter((e) => e.date === today)
      const todayHabits = discipline.filter((d) => d.date === today)

      const completedTasks = todayTasks.filter((t) => t.status === "completed").length
      const completedExercises = todayExercises.filter((e) => e.completed).length
      const completedHabits = todayHabits.filter((h) => h.completed).length

      const completedToday = completedTasks + completedExercises + completedHabits
      const totalGoals = todayTasks.length + todayExercises.length + todayHabits.length

      // Calculate active days (simplified)
      const uniqueDates = new Set([
        ...tasks.map((t) => t.created_at.split("T")[0]),
        ...exercises.map((e) => e.date),
        ...discipline.map((d) => d.date),
      ])

      setStats({
        completedToday,
        totalGoals,
        currentStreak:0,
        activeDays: uniqueDates.size,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Completed Today</p>
            <p className="text-2xl font-bold">{stats.completedToday}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Total Goals</p>
            <p className="text-2xl font-bold">{stats.totalGoals}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
            <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Current Streak</p>
            <p className="text-2xl font-bold">{stats.currentStreak} days</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Active Days</p>
            <p className="text-2xl font-bold">{stats.activeDays}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
