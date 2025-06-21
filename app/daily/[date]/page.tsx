"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "../../../lib/utils"
import { getDailyActivities, getDailySummary, createOrUpdateDailySummary } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function DailyPage() {
  const { date } = useParams()
  const formattedDate = formatDate(date)
  const [activities, setActivities] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  function calculateProductivity(activities) {
  const totalTasks = activities.tasks.length
  const completedTasks = activities.tasks.filter((t) => t.status === "completed").length
  const productivityFromTasks = totalTasks === 0 ? 0 : completedTasks / totalTasks

  const avgSkillProgress = activities.skills.length
    ? activities.skills.reduce((acc, s) => acc + (s.progress || 0), 0) / activities.skills.length
    : 0

  const productivity = (productivityFromTasks * 0.6 + (avgSkillProgress / 100) * 0.4) * 10
  return Math.round(productivity)
}

  function calculateFocusTime(activities) {
    const taskFocus = activities.tasks.reduce((total, task) => total + (task.duration || 0), 0)
    const skillFocus = activities.skills.reduce((total, skill) => total + (skill.progress || 0), 0)
    return taskFocus + skillFocus
  }

  function calculateMood(activities) {
    const moodEntries = activities.mood.map((m) => m.mood || 0)
    if (moodEntries.length === 0) return 0
    const total = moodEntries.reduce((a, b) => a + b, 0)
    return Math.round(total / moodEntries.length)
  }

  useEffect(() => {
    async function fetchDailyData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const [activitiesData] = await Promise.all([
          getDailyActivities(user.id, date),
        ])

        setActivities(activitiesData)

        const newSummary = {
          user_id: user.id,
          date,
          productivity_score: calculateProductivity(activitiesData),
          completed_tasks: activitiesData.tasks.filter((t) => t.status === "completed").length,

          total_tasks: activitiesData.tasks.length,
          focus_time: calculateFocusTime(activitiesData),
          mood_score: calculateMood(activitiesData),
        }

        const savedSummary = await createOrUpdateDailySummary(newSummary)
        setSummary(savedSummary)
      } catch (error) {
        console.error("Error fetching or saving summary:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyData()
  }, [date])

  if (loading) {
    return <DailyPageSkeleton date={formattedDate} />
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{formattedDate}</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <DailyTabs activities={activities} summary={summary} />
    </div>
  )
}

function DailyTabs({ activities, summary }) {
  return (
    <Tabs defaultValue="all" className="w-full ">
      <TabsList className="mb-4 grid grid-cols-3 h-auto gap-1 md:grid-cols-6">
        <TabsTrigger value="all">All Activities</TabsTrigger>
        <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        <TabsTrigger value="projects">Projects & Tasks</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="health">Health & Strength</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <DailyOverview summary={summary} />
        <ActivityList category="Skills" items={activities?.skills} />
        <ActivityList category="Intelligence" items={activities?.intelligence} />
        <ActivityList category="Finance" items={activities?.finance} />
        <ActivityList category="Health" items={activities?.health} />
        <ActivityList category="Strength" items={activities?.strength} />
        <ActivityList category="Tasks" items={activities?.tasks} />
      </TabsContent>

      <TabsContent value="skills" className="space-y-6">
        <ActivityList category="Skills" items={activities?.skills} />
      </TabsContent>

      <TabsContent value="intelligence" className="space-y-6">
        <ActivityList category="Intelligence" items={activities?.intelligence} />
      </TabsContent>

      <TabsContent value="finance" className="space-y-6">
        <ActivityList category="Finance" items={activities?.finance} />
      </TabsContent>

      <TabsContent value="health" className="space-y-6">
        <ActivityList category="Health" items={activities?.health} />
        <ActivityList category="Strength" items={activities?.strength} />
      </TabsContent>

      <TabsContent value="projects" className="space-y-6">
        <ActivityList category="Tasks" items={activities?.tasks} />
      </TabsContent>
    </Tabs>
  )
}

function DailyOverview({ summary }) {
  const productivityScore = summary?.productivity_score || 0
  const completedTasks = summary?.completed_tasks || 0
  const totalTasks = summary?.total_tasks || 0
  const focusTime = summary?.focus_time || 0
  const moodScore = summary?.mood_score || 0

  const taskCompletionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const focusTimeHours = Math.floor(focusTime / 60)
  const focusTimeMinutes = focusTime % 60
  const focusTimeFormatted = `${focusTimeHours}.${focusTimeMinutes.toString().padStart(2, "0")}`

  const getMoodText = (score) => {
    if (score <= 3) return "Low Energy"
    if (score <= 6) return "Neutral"
    return "Productive"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium">Productivity Score</div>
          <div className="text-3xl font-bold mt-1">{productivityScore}/10</div>
          <Progress value={productivityScore * 10} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium">Tasks Completed</div>
          <div className="text-3xl font-bold mt-1">
            {completedTasks}/{totalTasks}
          </div>
          <Progress value={taskCompletionPercentage} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium">Focus Time</div>
          <div className="text-3xl font-bold mt-1">{focusTimeFormatted} hours</div>
          <Progress value={(focusTime / 480) * 100} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-medium">Mood</div>
          <div className="text-3xl font-bold mt-1">{getMoodText(moodScore)}</div>
          <Progress value={moodScore * 10} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}

function ActivityList({ category, items = [] }) {
  const getActivityName = (item, category) => {
    switch (category) {
      case "Skills":
      return `${item.name} - ${item.progress}%`
      case "Intelligence":
        return item.title
      case "Finance":
        return `${item.type}: ${item.category} - $${item.amount}`
      case "Health":
      return `${item.type}: ${item.value} ${item.unit || ""}`
      case "Strength":
        return `${item.exercise}: ${item.sets || 0} sets, ${item.reps || 0} reps`
      case "Tasks":
        return item.title
      default:
        return "Unknown activity"
    }
  }

  const getActivityTime = (item) => {
    if (item.start_time) {
      return new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getActivityDuration = (item) => {
    if (item.duration) {
      return `${Math.floor(item.duration / 60)}h ${item.duration % 60}m`
    }
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time)
      const end = new Date(item.end_time)
      const durationMinutes = Math.round((end - start) / 60000)
      return `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
    }
    return "N/A"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{category}</CardTitle>
          <CardDescription>Activities tracked for {category.toLowerCase()}</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add {category}
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No {category.toLowerCase()} activities recorded for this day.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
              <div className="col-span-5 md:col-span-6">Activity</div>
              <div className="col-span-3 md:col-span-2">Time</div>
              <div className="col-span-2">Actions</div>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                <div className="col-span-5 md:col-span-6 font-medium">{getActivityName(item, category)}</div>
                <div className="col-span-3 md:col-span-2 text-sm text-muted-foreground">{getActivityTime(item)}</div>
                
                <div className="col-span-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DailyPageSkeleton({ date }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
        </div>

        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-28" />
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                    <div className="col-span-5 md:col-span-6">Activity</div>
                    <div className="col-span-3 md:col-span-2">Time</div>
                    <div className="col-span-3 md:col-span-3">Duration</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  {Array(3)
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0">
                        <div className="col-span-5 md:col-span-6">
                          <Skeleton className="h-5 w-full max-w-[200px]" />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="col-span-3 md:col-span-3">
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="col-span-1">
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
