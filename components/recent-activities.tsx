import { BookOpen, Dumbbell, Star, Target, PenTool } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      activity: "Completed Frontend Tutorial",
      time: "2 hours ago",
      category: "Skills",
      icon: Target,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900",
    },
    {
      id: 2,
      activity: "Read 45 pages of Atomic Habits",
      time: "Yesterday",
      category: "Intelligence",
      icon: BookOpen,
      color: "text-purple-500 bg-purple-100 dark:bg-purple-900",
    },
    {
      id: 3,
      activity: "Completed full workout session",
      time: "Yesterday",
      category: "Strength",
      icon: Dumbbell,
      color: "text-orange-500 bg-orange-100 dark:bg-orange-900",
    },
    {
      id: 4,
      activity: "Completed Project Milestone",
      time: "2 days ago",
      category: "Projects",
      icon: PenTool,
      color: "text-green-500 bg-green-100 dark:bg-green-900",
    },
    {
      id: 5,
      activity: "Earned 'Week Streak' Badge",
      time: "3 days ago",
      category: "Achievements",
      icon: Star,
      color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Your latest tracked activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn("rounded-full p-2", activity.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.category}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
