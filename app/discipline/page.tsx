"use client"

import { useState } from "react"
import { Calendar, CheckCircle, Plus, Target, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function DisciplinePage() {
  const { toast } = useToast()
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: "Morning Meditation",
      description: "10 minutes of mindfulness meditation",
      streak: 7,
      target: 30,
      completed: false,
      category: "mindfulness",
    },
    {
      id: 2,
      name: "Read for 30 minutes",
      description: "Daily reading habit",
      streak: 12,
      target: 30,
      completed: true,
      category: "learning",
    },
    {
      id: 3,
      name: "No Social Media",
      description: "Avoid social media during work hours",
      streak: 3,
      target: 30,
      completed: false,
      category: "focus",
    },
    {
      id: 4,
      name: "Exercise",
      description: "30 minutes of physical activity",
      streak: 5,
      target: 30,
      completed: true,
      category: "health",
    },
  ])

  const toggleHabit = (habitId) => {
    setHabits(
      habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completed: !habit.completed,
              streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            }
          : habit,
      ),
    )

    const habit = habits.find((h) => h.id === habitId)
    toast({
      title: habit?.completed ? "Habit Unchecked" : "Habit Completed!",
      description: habit?.completed
        ? `${habit.name} marked as incomplete`
        : `Great job! ${habit?.name} completed for today`,
    })
  }

  const addNewHabit = () => {
    toast({
      title: "Add New Habit",
      description: "Habit creation form would open here",
    })
  }

  const completedToday = habits.filter((h) => h.completed).length
  const totalHabits = habits.length
  const averageStreak = Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length)
  const longestStreak = Math.max(...habits.map((h) => h.streak))

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
        <Button onClick={addNewHabit} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
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
              <p className="text-lg md:text-2xl font-bold">{Math.round((completedToday / totalHabits) * 100)}%</p>
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

        <TabsContent value="all" className="space-y-4">
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
