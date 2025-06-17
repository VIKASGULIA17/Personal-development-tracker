"use client"

import { useState, useEffect } from "react"
import { BookOpen, Video, Headphones, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getIntelligenceItems } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function IntelligenceStats() {
  const [stats, setStats] = useState({
    total: 0,
    books: 0,
    videos: 0,
    podcasts: 0,
    courses: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      try {
        const items = await getIntelligenceItems(user.id)

        const newStats = {
          total: items.length,
          books: items.filter((item) => item.type === "book").length,
          videos: items.filter((item) => item.type === "video").length,
          podcasts: items.filter((item) => item.type === "podcast").length,
          courses: items.filter((item) => item.type === "course").length,
          completed: items.filter((item) => item.status === "completed").length,
        }

        setStats(newStats)
      } catch (error) {
        console.error("Error loading intelligence stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
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
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Books</p>
            <p className="text-2xl font-bold">{stats.books}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
            <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Videos</p>
            <p className="text-2xl font-bold">{stats.videos}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
            <Headphones className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Podcasts</p>
            <p className="text-2xl font-bold">{stats.podcasts}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
            <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
