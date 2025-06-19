"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, Plus, Clock, Target, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getTimeSessions, createTimeSession } from "@/lib/db"

export default function TimeTrackingPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [currentTask, setCurrentTask] = useState("")
  const [currentCategory, setCurrentCategory] = useState("focus")
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [sessionForm, setSessionForm] = useState({
    task: "",
    category: "focus",
    duration: "",
  })

  const [pomodoroSettings] = useState({
    workDuration: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  })

  // Fetch sessions on component mount
  useEffect(() => {
    if (user?.id) {
      fetchSessions()
    }
  }, [user])

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime((time) => time + 1)
      }, 1000)
    } else if (!isRunning && time !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, time])

  const fetchSessions = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getTimeSessions(user.id)
      setSessions(data)
    } catch (err) {
      // Handle missing table gracefully
      if (err.message?.includes('relation "public.time_sessions" does not exist')) {
        setError("Time tracking table not set up yet. Please run the database setup scripts.")
        setSessions([]) // Use empty array as fallback
      } else {
        setError("Failed to fetch time sessions")
      }
      console.error("Error fetching sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    toast({
      title: "Timer Started",
      description: "Focus session has begun",
    })
  }

  const pauseTimer = () => {
    setIsRunning(false)
    toast({
      title: "Timer Paused",
      description: "Take a break when needed",
    })
  }

  const stopTimer = async () => {
    if (time > 0 && user?.id) {
      try {
        const sessionData = {
          user_id: user.id,
          task: currentTask || "Focus Session",
          duration: time,
          category: currentCategory,
          date: new Date().toISOString().split("T")[0],
          completed: true,
        }

        const createdSession = await createTimeSession(sessionData)
        if (createdSession) {
          setSessions((prev) => [createdSession, ...prev])
          toast({
            title: "Session Completed!",
            description: `Great job! You focused for ${formatTime(time)}`,
          })
        }
      } catch (err) {
        if (err.message?.includes('relation "public.time_sessions" does not exist')) {
          // Still show success message but don't save to database
          toast({
            title: "Session Completed!",
            description: `Great job! You focused for ${formatTime(time)} (Note: Database not set up)`,
          })
        } else {
          setError("Failed to save session")
          console.error("Error saving session:", err)
        }
      }
    }

    setIsRunning(false)
    setTime(0)
    setCurrentTask("")
    setCurrentCategory("focus")
  }

  const startPomodoro = () => {
    setTime(0)
    setCurrentTask("Pomodoro Session")
    setCurrentCategory("focus")
    setIsRunning(true)
    toast({
      title: "Pomodoro Started",
      description: "25 minutes of focused work ahead!",
    })
  }

  const handleAddSession = async (e) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const sessionData = {
        user_id: user.id,
        task: sessionForm.task,
        duration: Number.parseInt(sessionForm.duration) * 60, // convert minutes to seconds
        category: sessionForm.category,
        date: new Date().toISOString().split("T")[0],
        completed: true,
      }

      const createdSession = await createTimeSession(sessionData)
      if (createdSession) {
        setSessions((prev) => [createdSession, ...prev])
        setSessionForm({ task: "", category: "focus", duration: "" })
        setIsAddModalOpen(false)
        toast({
          title: "Session Added!",
          description: "Time session has been logged",
        })
      }
    } catch (err) {
      if (err.message?.includes('relation "public.time_sessions" does not exist')) {
        setError("Time tracking table not set up yet. Please run the database setup scripts.")
        toast({
          title: "Database Setup Required",
          description: "Please set up the time tracking table first",
          variant: "destructive",
        })
      } else {
        setError("Failed to add session")
      }
      console.error("Error adding session:", err)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const totalTimeToday = sessions
    .filter((s) => s.date === new Date().toISOString().split("T")[0])
    .reduce((acc, s) => acc + s.duration, 0)

  const averageSessionTime =
    sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length) : 0

  const todaySessions = sessions.filter((s) => s.date === new Date().toISOString().split("T")[0]).length

  const weeklyTime = sessions
    .filter((s) => {
      const sessionDate = new Date(s.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    })
    .reduce((acc, s) => acc + s.duration, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Please log in to track your time</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Time Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your focus time and productivity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={startPomodoro} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Start Pomodoro
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Time Session</DialogTitle>
                <DialogDescription>Log a completed time session manually</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSession} className="space-y-4">
                <div>
                  <Label htmlFor="task">Task</Label>
                  <Input
                    id="task"
                    value={sessionForm.task}
                    onChange={(e) => setSessionForm((prev) => ({ ...prev, task: e.target.value }))}
                    placeholder="What did you work on?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={sessionForm.category}
                    onValueChange={(value) => setSessionForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focus">Focus</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="25"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Session</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">Focus Timer</CardTitle>
          <CardDescription className="text-center">Stay focused and track your productive time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 md:space-y-6">
            <div className="text-4xl md:text-6xl font-bold font-mono">{formatTime(time)}</div>

            {isRunning && (
              <div className="space-y-2">
                <Input
                  placeholder="What are you working on?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  className="text-center"
                />
                <Select value={currentCategory} onValueChange={setCurrentCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focus">Focus</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-center">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="w-full md:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button onClick={pauseTimer} size="lg" variant="outline" className="w-full md:w-auto">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}

              <Button onClick={stopTimer} size="lg" variant="destructive" className="w-full md:w-auto">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>

            {time >= pomodoroSettings.workDuration && (
              <div className="p-3 md:p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm md:text-base text-green-700 dark:text-green-300 font-medium">
                  🎉 Pomodoro Complete! Time for a break.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
              <Clock className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Today's Time</p>
              <p className="text-lg md:text-2xl font-bold">{formatDuration(totalTimeToday)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-green-100 dark:bg-green-900">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Sessions</p>
              <p className="text-lg md:text-2xl font-bold">{todaySessions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Avg Session</p>
              <p className="text-lg md:text-2xl font-bold">{formatDuration(averageSessionTime)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">This Week</p>
              <p className="text-lg md:text-2xl font-bold">{formatDuration(weeklyTime)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions History */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="text-xs md:text-sm">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs md:text-sm">
            This Week
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs md:text-sm">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Today's Sessions</CardTitle>
              <CardDescription className="text-sm">Your focus sessions for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {sessions
                  .filter((s) => s.date === new Date().toISOString().split("T")[0])
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm md:text-base">{session.task}</h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {session.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Duration: {formatDuration(session.duration)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                          {session.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    </div>
                  ))}

                {sessions.filter((s) => s.date === new Date().toISOString().split("T")[0]).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sessions recorded today. Start your first session!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Weekly Overview</CardTitle>
              <CardDescription className="text-sm">Your productivity this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{formatDuration(weeklyTime)}</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-green-600">
                      {
                        sessions.filter((s) => {
                          const sessionDate = new Date(s.date)
                          const weekAgo = new Date()
                          weekAgo.setDate(weekAgo.getDate() - 7)
                          return sessionDate >= weekAgo
                        }).length
                      }
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Time by Category</CardTitle>
              <CardDescription className="text-sm">See where you spend your time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {["focus", "coding", "learning", "health", "creative"].map((category) => {
                  const categoryTime = sessions
                    .filter((s) => s.category === category)
                    .reduce((acc, s) => acc + s.duration, 0)
                  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0)
                  const percentage = totalTime > 0 ? (categoryTime / totalTime) * 100 : 0

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(categoryTime)} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
