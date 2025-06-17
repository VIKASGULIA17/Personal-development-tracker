import { Check, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TodayGoals() {
  const goals = [
    { id: 1, task: "Complete 2 coding problems", completed: true, category: "Skills" },
    { id: 2, task: "Read 30 pages of 'Atomic Habits'", completed: false, category: "Intelligence" },
    { id: 3, task: "Review monthly budget", completed: false, category: "Finance" },
    { id: 4, task: "Complete 4 Pomodoro sessions", completed: true, category: "Discipline" },
    { id: 5, task: "Drink 2L of water", completed: false, category: "Health" },
    { id: 6, task: "30 pushups", completed: true, category: "Strength" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Goals</CardTitle>
        <CardDescription>Your goals for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-start gap-2">
              <div className="mt-1">
                {goal.completed ? (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className={goal.completed ? "text-sm line-through text-muted-foreground" : "text-sm"}>{goal.task}</p>
                <p className="text-xs text-muted-foreground">{goal.category}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
