"use client"

import { useState, useEffect } from "react"
import { Trophy, Star, Target, Zap, Award, Medal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Mock data for achievements
    const mockAchievements = [
      {
        id: 1,
        name: "First Steps",
        description: "Complete your first task",
        badge_type: "milestone",
        date_earned: "2024-01-15",
        icon: Target,
        color: "bg-blue-500",
        earned: true,
      },
      {
        id: 2,
        name: "Week Warrior",
        description: "Complete tasks for 7 consecutive days",
        badge_type: "streak",
        date_earned: "2024-01-22",
        icon: Zap,
        color: "bg-yellow-500",
        earned: true,
      },
      {
        id: 3,
        name: "Skill Master",
        description: "Complete 5 skills",
        badge_type: "milestone",
        date_earned: null,
        icon: Star,
        color: "bg-purple-500",
        earned: false,
        progress: 60,
      },
      {
        id: 4,
        name: "Bookworm",
        description: "Read 10 books",
        badge_type: "milestone",
        date_earned: "2024-02-01",
        icon: Award,
        color: "bg-green-500",
        earned: true,
      },
      {
        id: 5,
        name: "Fitness Enthusiast",
        description: "Complete 30 workouts",
        badge_type: "milestone",
        date_earned: null,
        icon: Medal,
        color: "bg-red-500",
        earned: false,
        progress: 75,
      },
      {
        id: 6,
        name: "Money Manager",
        description: "Track expenses for 30 days",
        badge_type: "streak",
        date_earned: null,
        icon: Trophy,
        color: "bg-indigo-500",
        earned: false,
        progress: 40,
      },
    ]

    setTimeout(() => {
      setAchievements(mockAchievements)
      setLoading(false)
    }, 1000)
  }, [user])

  const earnedAchievements = achievements.filter((a) => a.earned)
  const unlockedAchievements = achievements.filter((a) => !a.earned)

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">Celebrate your milestones and track your progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-yellow-100 dark:bg-yellow-900">
              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Total Earned</p>
              <p className="text-2xl font-bold">{earnedAchievements.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">In Progress</p>
              <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Streak Badges</p>
              <p className="text-2xl font-bold">{earnedAchievements.filter((a) => a.badge_type === "streak").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Milestones</p>
              <p className="text-2xl font-bold">
                {earnedAchievements.filter((a) => a.badge_type === "milestone").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Earned ({earnedAchievements.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({unlockedAchievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="earned" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedAchievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card key={achievement.id} className="relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Earned
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`rounded-full p-3 ${achievement.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Earned on {new Date(achievement.date_earned).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unlockedAchievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card key={achievement.id} className="relative overflow-hidden opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`rounded-full p-3 ${achievement.color} opacity-50`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    {achievement.progress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
