"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle, Target, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getDisciplineEntries, toggleDisciplineCompletion } from "@/lib/db"
import AddHabitDialog from "../../components/AddHabitDialogue"
import { supabase } from "@/lib/supabase" 


export default function DisciplinePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadHabits()
    }
  }, [user])

  const calculateStreak = (dates) => {
    const today = new Date()
    const dateSet = new Set(dates)
    let streak = 0
    for (let i = 0; ; i++) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateString = d.toISOString().split("T")[0]
      if (dateSet.has(dateString)) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const loadHabits = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const data = await getDisciplineEntries(user.id)


      const { data: completions } = await supabase
        .from("discipline_completion")
        .select("discipline_id, date")
        .eq("user_id", user.id)

      const completedMap = new Map()
      completions?.forEach((c) => {
        completedMap.set(c.discipline_id + "_" + c.date, true)
      })

      const grouped = data.reduce((acc, entry) => {
        if (!acc[entry.name]) acc[entry.name] = []
        acc[entry.name].push(entry)
        return acc
      }, {})

      const transformedHabits = Object.entries(grouped).map(([name, entries]) => {
        const first = entries[0]
        const completedDates = completions
          .filter((c) => c.discipline_id === first.id)
          .map((c) => c.date)

        return {
          id: first.id,
          name,
          description: first.description,
          category: first.type,
          completed: completedMap.has(first.id + "_" + today),
          streak: calculateStreak(completedDates),
          target: 30,
        }
      })

      setHabits(transformedHabits)
    } catch (error) {
      console.error("Error loading habits:", error)
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (habitId) => {
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const nowCompleted = await toggleDisciplineCompletion(user.id, habitId, today)

      setHabits(
        habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completed: nowCompleted,
                streak: nowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
              }
            : h,
        ),
      )

      toast({
        title: nowCompleted ? "Habit Completed!" : "Habit Unchecked",
        description: nowCompleted
          ? `Great job! ${habit.name} completed for today`
          : `${habit.name} marked as incomplete`,
      })
    } catch (error) {
      console.error("Error toggling habit:", error)
      toast({
        title: "Error",
        description: "Failed to update habit status",
        variant: "destructive",
      })
    }
  }

  const completedToday = habits.filter((h) => h.completed).length
  const totalHabits = habits.length
  const averageStreak = totalHabits > 0 ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / totalHabits) : 0
  const longestStreak = totalHabits > 0 ? Math.max(...habits.map((h) => h.streak)) : 0

  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Discipline</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Build consistent habits and track your discipline
          </p>
        </div>
        <AddHabitDialog onHabitAdded={loadHabits} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Today's Progress</p>
              <p className="text-lg md:text-2xl font-bold">
                {completedToday}/{totalHabits}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Average Streak</p>
              <p className="text-lg md:text-2xl font-bold">{averageStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Longest Streak</p>
              <p className="text-lg md:text-2xl font-bold">{longestStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Completion Rate</p>
              <p className="text-lg md:text-2xl font-bold">
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs md:text-sm">
            All Habits
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs md:text-sm">
            Completed
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs md:text-sm">
            Pending
          </TabsTrigger>
          <TabsTrigger value="streaks" className="text-xs md:text-sm">
            Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 capitalize">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Today's Habits</CardTitle>
              <CardDescription className="text-sm">Track your daily habits and build consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg transition-all ${
                      habit.completed ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : ""
                    }`}
                  >
                    <Checkbox
                      checked={habit.completed}
                      onCheckedChange={() => toggleHabit(habit.id)}
                      className="self-start md:self-center"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3
                          className={`font-medium text-sm md:text-base ${habit.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {habit.name}
                        </h3>
                        <Badge variant="outline" className="text-xs w-fit">
                          {habit.category}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">{habit.description}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Streak:</span>
                          <span className="text-xs font-medium">{habit.streak} days</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs text-muted-foreground">Progress:</span>
                          <Progress value={(habit.streak / habit.target) * 100} className="h-2 flex-1 max-w-[100px]" />
                          <span className="text-xs text-muted-foreground">
                            {habit.streak}/{habit.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Completed Today</CardTitle>
              <CardDescription className="text-sm">Habits you've completed today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {habits
                  .filter((h) => h.completed)
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    >
                      <Checkbox
                        checked={habit.completed}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className="self-start md:self-center"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm md:text-base line-through text-muted-foreground">
                            {habit.name}
                          </h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {habit.category}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">{habit.description}</p>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Streak:</span>
                            <span className="text-xs font-medium">{habit.streak} days</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-muted-foreground">Progress:</span>
                            <Progress
                              value={(habit.streak / habit.target) * 100}
                              className="h-2 flex-1 max-w-[100px]"
                            />
                            <span className="text-xs text-muted-foreground">
                              {habit.streak}/{habit.target}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Pending Habits</CardTitle>
              <CardDescription className="text-sm">Habits still to complete today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {habits
                  .filter((h) => !h.completed)
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                    >
                      <Checkbox
                        checked={habit.completed}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className="self-start md:self-center"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm md:text-base">{habit.name}</h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {habit.category}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">{habit.description}</p>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Streak:</span>
                            <span className="text-xs font-medium">{habit.streak} days</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-muted-foreground">Progress:</span>
                            <Progress
                              value={(habit.streak / habit.target) * 100}
                              className="h-2 flex-1 max-w-[100px]"
                            />
                            <span className="text-xs text-muted-foreground">
                              {habit.streak}/{habit.target}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Habit Streaks</CardTitle>
              <CardDescription className="text-sm">Your consistency tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {habits
                  .sort((a, b) => b.streak - a.streak)
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm md:text-base">{habit.name}</h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {habit.category}
                          </Badge>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Current streak:</span>
                            <span className="text-sm font-bold text-primary">{habit.streak} days</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Progress
                              value={(habit.streak / habit.target) * 100}
                              className="h-2 flex-1 max-w-[150px]"
                            />
                            <span className="text-xs text-muted-foreground">
                              {Math.round((habit.streak / habit.target) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
