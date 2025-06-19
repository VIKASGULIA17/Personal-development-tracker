"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import {
  getTasks,
  getExercises,
  getDisciplineEntries,
  updateTask,
  updateExercise,
  updateDisciplineEntry,
} from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function TodayGoals() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (user) {
      loadTodayGoals()
    }
  }, [user])

  const loadTodayGoals = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const [tasks, exercises, discipline] = await Promise.all([
        getTasks(user.id),
        getExercises(user.id),
        getDisciplineEntries(user.id),
      ])

      const todayGoals = [
        ...tasks
          .filter((t) => t.created_at.split("T")[0] === today)
          .slice(0, 3)
          .map((t) => ({
            id: `task-${t.id}`,
            name: t.title,
            type: "task",
            completed: t.status === "completed",
            originalId: t.id,
          })),
        ...exercises
          .filter((e) => e.date === today)
          .slice(0, 3)
          .map((e) => ({
            id: `exercise-${e.id}`,
            name: e.exercise,
            type: "exercise",
            completed: e.completed,
            originalId: e.id,
          })),
        ...discipline
          .filter((d) => d.date === today)
          .slice(0, 3)
          .map((d) => ({
            id: `habit-${d.id}`,
            name: d.name,
            type: "habit",
            completed: d.completed,
            originalId: d.id,
          })),
      ]

      setGoals(todayGoals.slice(0, 5))
    } catch (error) {
      console.error("Error loading today's goals:", error)
    }
  }

  const toggleGoal = async (goalId) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    try {
      if (goal.type === "task") {
        await updateTask(goal.originalId, { status: goal.completed ? "todo" : "completed" })
      } else if (goal.type === "exercise") {
        await updateExercise(user.id, goal.originalId, { completed: !goal.completed })
      } else if (goal.type === "habit") {
        await updateDisciplineEntry(goal.originalId, { completed: !goal.completed })
      }

      setGoals(goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g)))

      toast({
        title: goal.completed ? "Goal Unchecked" : "Goal Completed!",
        description: `${goal.name} ${goal.completed ? "marked as incomplete" : "completed"}`,
      })
    } catch (error) {
      console.error("Error toggling goal:", error)
      toast({
        title: "Error",
        description: "Failed to update goal status",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-[90%] lg:w-full">
      <CardHeader>
        <CardTitle>Today's Goals</CardTitle>
        <CardDescription>Complete your daily objectives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No goals for today</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                <Checkbox checked={goal.completed} onCheckedChange={() => toggleGoal(goal.id)} />
                <span className={`flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                  {goal.name}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
