"use client"

import { CheckCircle, Clock, Search, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import AddSkillButton from "@/components/skills/add-skill-button"
import SkillsList from "@/components/skills/skills-list"
import { useState,useEffect } from "react"
import { getSkills } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [totalSkills, setTotalSkills] = useState(0)
  const [completedSkills, setCompletedSkills] = useState(0)
  const [inProgressSkills, setInProgressSkills] = useState(0)
  const [weeklyGoals, setWeeklyGoals] = useState(0)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchSkills()
    }
  }, [authLoading, user])

  const fetchSkills = async () => {
    try {
      const data = await getSkills(user.id)
      setSkills(data)

      setTotalSkills(data.length)
      setCompletedSkills(data.filter((s) => s.progress === 100).length)
      setInProgressSkills(data.filter((s) => s.progress > 0 && s.progress < 100).length)

      // 🔄 Fetch weekly progress
      const now = new Date()
      const currentWeekStart = new Date(now)
      currentWeekStart.setDate(now.getDate() - now.getDay())
      currentWeekStart.setHours(0, 0, 0, 0)

      const { data: progressLogs, error } = await supabase
        .from("skill_progress_log")
        .select("progress")
        .eq("user_id", user.id)
        .gte("created_at", currentWeekStart.toISOString())

      if (error) throw error

      // 🧠 Calculate average progress increase this week
      if (progressLogs.length > 0) {
        const totalProgress = progressLogs.reduce((sum, log) => sum + log.progress, 0)
        const avgProgress = totalProgress / progressLogs.length
        setWeeklyGoals(Math.round(avgProgress))
      } else {
        setWeeklyGoals(0)
      }
    } catch (error) {
      console.error("Failed to load skills", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skills Tracking</h1>
          <p className="text-muted-foreground">Monitor your learning progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search skills..." className="w-full pl-8 md:w-[200px] lg:w-[300px]" />
          </div>
          <AddSkillButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Total Skills</p>
              <p className="text-2xl font-bold">{totalSkills}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Completed</p>
              <p className="text-2xl font-bold">{completedSkills}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">In Progress</p>
              <p className="text-2xl font-bold">{inProgressSkills}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Weekly Goal</p>
              <p className="text-2xl font-bold">{weeklyGoals}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skills Progress</CardTitle>
          <CardDescription>Track your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsList />
        </CardContent>
      </Card>
    </div>
  )
}
