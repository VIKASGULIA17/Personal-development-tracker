"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getTasks, getExercises, getDisciplineEntries } from "@/lib/db"

export default function RecentActivities() {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])

  useEffect(() => {
    if (user) {
      loadRecentActivities()
    }
  }, [user])

  const loadRecentActivities = async () => {
    try {
      const [tasks, exercises, discipline] = await Promise.all([
        getTasks(user.id),
        getExercises(user.id),
        getDisciplineEntries(user.id),
      ])

      // Combine and sort all activities
      const allActivities = [
        ...tasks.slice(0, 3).map((t) => ({
          id: `task-${t.id}`,
          name: t.title,
          type: "Task",
          status: t.status,
          time: new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(t.created_at).toLocaleDateString(),
        })),
        ...exercises.slice(0, 3).map((e) => ({
          id: `exercise-${e.id}`,
          name: e.exercise,
          type: "Exercise",
          status: e.completed ? "completed" : "pending",
          time: new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(e.created_at).toLocaleDateString(),
        })),
        ...discipline.slice(0, 3).map((d) => ({
          id: `habit-${d.id}`,
          name: d.name,
          type: "Habit",
          status: d.completed ? "completed" : "pending",
          time: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(d.created_at).toLocaleDateString(),
        })),
      ]

      // Sort by most recent and take top 5
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date))
      setActivities(allActivities.slice(0, 5))
    } catch (error) {
      console.error("Error loading recent activities:", error)
    }
  }

  return (
    <Card className="w-[91%] lg:w-full">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your latest tracked activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent activities</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.date} at {activity.time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activity.type}</Badge>
                  <Badge variant={activity.status === "completed" ? "default" : "secondary"}>{activity.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
