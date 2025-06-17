import { ArrowUpCircle, Brain, Clock, Dumbbell, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Skills Streak</p>
            <p className="text-2xl font-bold">7 days</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+2</span> from last week
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900">
            <Brain className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Books Read</p>
            <p className="text-2xl font-bold">3 this month</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+1</span> from last month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
            <Clock className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Focus Time</p>
            <p className="text-2xl font-bold">12.5 hours</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+3.2h</span> from last week
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
            <Dumbbell className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Workouts</p>
            <p className="text-2xl font-bold">4 this week</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+1</span> from last week
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
