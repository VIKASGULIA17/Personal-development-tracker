"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { getExercises, getProjects, getTasks } from "@/lib/db"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalExercises: 0,
    completedExercises: 0,
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // data from supabase <--
      const [exercises, projects, tasks] = await Promise.all([
        getExercises(user.id),
        getProjects(user.id),
        getTasks(user.id),
      ])

      // to calculate top bars 
      const completedExercises = exercises.filter((e) => e.completed).length
      const completedProjects = projects.filter((p) => p.status === "completed").length
      const completedTasks = tasks.filter((t) => t.status === "completed").length
      const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length

      setAnalytics({
        totalExercises: exercises.length,
        completedExercises,
        totalProjects: projects.length,
        completedProjects,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // to calculate percentages
  const exerciseCompletionRate =
    analytics.totalExercises > 0 ? Math.round((analytics.completedExercises / analytics.totalExercises) * 100) : 0

  const projectCompletionRate =
    analytics.totalProjects > 0 ? Math.round((analytics.completedProjects / analytics.totalProjects) * 100) : 0

  const taskCompletionRate =
    analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0

  const overallProgress = Math.round((exerciseCompletionRate + projectCompletionRate + taskCompletionRate) / 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Please log in to view your analytics</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your personal growth</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Overall Progress</p>
              <p className="text-2xl font-bold">{overallProgress}%</p>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Goals Achieved</p>
              <p className="text-2xl font-bold">
                {analytics.completedExercises + analytics.completedProjects + analytics.completedTasks}
              </p>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Active Items</p>
              <p className="text-2xl font-bold">{analytics.inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">In progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Total Items</p>
              <p className="text-2xl font-bold">
                {analytics.totalExercises + analytics.totalProjects + analytics.totalTasks}
              </p>
              <p className="text-xs text-muted-foreground">All categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Your progress across different areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exercise Completion</span>
                    <span className="text-sm text-muted-foreground">{exerciseCompletionRate}%</span>
                  </div>
                  <Progress value={exerciseCompletionRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Project Completion</span>
                    <span className="text-sm text-muted-foreground">{projectCompletionRate}%</span>
                  </div>
                  <Progress value={projectCompletionRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task Completion</span>
                    <span className="text-sm text-muted-foreground">{taskCompletionRate}%</span>
                  </div>
                  <Progress value={taskCompletionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.completedExercises > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Exercise Milestone</p>
                      <p className="text-xs text-muted-foreground">
                        {analytics.completedExercises} exercises completed
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      Fitness
                    </Badge>
                  </div>
                )}
                {analytics.completedProjects > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Project Success</p>
                      <p className="text-xs text-muted-foreground">{analytics.completedProjects} projects completed</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      Projects
                    </Badge>
                  </div>
                )}
                {analytics.completedTasks > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Task Master</p>
                      <p className="text-xs text-muted-foreground">{analytics.completedTasks} tasks completed</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      Tasks
                    </Badge>
                  </div>
                )}
                {analytics.completedExercises === 0 &&
                  analytics.completedProjects === 0 &&
                  analytics.completedTasks === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <p>No achievements yet</p>
                      <p className="text-sm">
                        Start completing exercises, projects, and tasks to see your achievements!
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Analytics</CardTitle>
              <CardDescription>Detailed breakdown of your fitness progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.totalExercises}</p>
                    <p className="text-sm text-muted-foreground">Total Exercises</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.completedExercises}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{exerciseCompletionRate}%</p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Your project management insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.totalProjects}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.completedProjects}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{projectCompletionRate}%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
              <CardDescription>Track your task completion patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.totalTasks}</p>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.completedTasks}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analytics.inProgressTasks}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{taskCompletionRate}%</p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
