"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Calendar from "@/components/calendar"
import DashboardStats from "@/components/dashboard-stats"
import RecentActivities from "@/components/recent-activities"
import TodayGoals from "@/components/today-goals"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getExercises, getTasks, getProjects, getTimeSessions, getMoodEntries, getDisciplineEntries } from "@/lib/db"


export default function Dashboard() {
  
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    skillsProgress: 0,
    readingGoals: 0,
    workoutStreak: 0,
    financialGoals: 0,
    projectsCompletion: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [exercises, tasks, projects, timeSessions, moodEntries, disciplineEntries] = await Promise.all([
        getExercises(user.id),
        getTasks(user.id),
        getProjects(user.id),
        getTimeSessions(user.id),
        getMoodEntries(user.id),
        getDisciplineEntries(user.id),
      ])

      // Calculate progress percentages
      const completedExercises = exercises.filter((e) => e.completed).length
      const workoutStreak = exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0

      const completedTasks = tasks.filter((t) => t.status === "completed").length
      const projectsCompletion = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

      const completedProjects = projects.filter((p) => p.status === "completed").length
      const projectProgress = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0

      const learningHabits = disciplineEntries.filter((d) => d.type === "learning")
      const completedLearning = learningHabits.filter((h) => h.completed).length
      const readingGoals = learningHabits.length > 0 ? (completedLearning / learningHabits.length) * 100 : 0

      const skillHabits = disciplineEntries.filter((d) => d.type === "skill" || d.type === "creativity")
      const completedSkills = skillHabits.filter((h) => h.completed).length
      const skillsProgress = skillHabits.length > 0 ? (completedSkills / skillHabits.length) * 100 : 0

      const financeHabits = disciplineEntries.filter((d) => d.type === "finance")
      const completedFinance = financeHabits.filter((h) => h.completed).length
      const financialGoals = financeHabits.length > 0 ? (completedFinance / financeHabits.length) * 100 : 0

      setDashboardData({
        skillsProgress: Math.round(skillsProgress),
        readingGoals: Math.round(readingGoals),
        workoutStreak: Math.round(workoutStreak),
        financialGoals: Math.round(financialGoals),
        projectsCompletion: Math.round(projectProgress),
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">May 22, 2025</span>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Your performance across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Skills Progress</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.skillsProgress}%</span>
                </div>
                <Progress value={dashboardData.skillsProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reading Goals</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.readingGoals}%</span>
                </div>
                <Progress value={dashboardData.readingGoals} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Workout Streak</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.workoutStreak}%</span>
                </div>
                <Progress value={dashboardData.workoutStreak} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Financial Goals</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.financialGoals}%</span>
                </div>
                <Progress value={dashboardData.financialGoals} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Projects Completion</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.projectsCompletion}%</span>
                </div>
                <Progress value={dashboardData.projectsCompletion} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Track your daily activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TodayGoals />
        <RecentActivities />
      </div>
    </div>
  )
}
