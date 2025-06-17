"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, Plus, Clock, Target, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function TimeTrackingPage() {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0) // in seconds
  const [currentTask, setCurrentTask] = useState(null)
  const [sessions, setSessions] = useState([
    {
      id: 1,
      task: "React Development",
      duration: 1800, // 30 minutes
      category: "coding",
      date: new Date().toISOString().split("T")[0],
      completed: true,
    },
    {
      id: 2,
      task: "Reading - Atomic Habits",
      duration: 1500, // 25 minutes
      category: "learning",
      date: new Date().toISOString().split("T")[0],
      completed: true,
    },
    {
      id: 3,
      task: "Exercise",
      duration: 2700, // 45 minutes
      category: "health",
      date: new Date().toISOString().split("T")[0],
      completed: true,
    },
  ])

  const [pomodoroSettings] = useState({
    workDuration: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
  })

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

  const stopTimer = () => {
    if (time > 0) {
      const newSession = {
        id: sessions.length + 1,
        task: currentTask || "Focus Session",
        duration: time,
        category: "focus",
        date: new Date().toISOString().split("T")[0],
        completed: true,
      }
      setSessions([...sessions, newSession])

      toast({
        title: "Session Completed!",
        description: `Great job! You focused for ${formatTime(time)}`,
      })
    }

    setIsRunning(false)
    setTime(0)
    setCurrentTask(null)
  }

  const startPomodoro = () => {
    setTime(0)
    setCurrentTask("Pomodoro Session")
    setIsRunning(true)
    toast({
      title: "Pomodoro Started",
      description: "25 minutes of focused work ahead!",
    })
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Time Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your focus time and productivity</p>
        </div>
        <Button onClick={startPomodoro} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Start Pomodoro
        </Button>
      </div>

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">Focus Timer</CardTitle>
          <CardDescription className="text-center">Stay focused and track your productive time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 md:space-y-6">
            <div className="text-4xl md:text-6xl font-bold font-mono">{formatTime(time)}</div>

            {currentTask && (
              <div className="text-sm md:text-base text-muted-foreground">
                Working on: <span className="font-medium">{currentTask}</span>
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
              <p className="text-lg md:text-2xl font-bold">{formatDuration(totalTimeToday * 5)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions History */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="text-xs md:text-sm">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="text-xs md:text-sm">
            This Week
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs md:text-sm">
            Pomodoro
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
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {formatDuration(totalTimeToday * 7)}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl md:text-3xl font-bold text-green-600">{todaySessions * 7}</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-12">{day}</span>
                      <Progress value={Math.random() * 100} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-16">
                        {formatDuration(Math.floor(Math.random() * 7200))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pomodoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Pomodoro Technique</CardTitle>
              <CardDescription className="text-sm">25-minute focused work sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl md:text-2xl font-bold">25m</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Work Session</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl md:text-2xl font-bold">5m</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Short Break</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl md:text-2xl font-bold">15m</div>
                    <p className="text-xs md:text-sm text-muted-foreground">Long Break</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={startPomodoro} size="lg" className="w-full md:w-auto">
                    <Play className="mr-2 h-4 w-4" />
                    Start Pomodoro Session
                  </Button>
                </div>

                <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-sm md:text-base mb-2">How it works:</h4>
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                    <li>• Work for 25 minutes with full focus</li>
                    <li>• Take a 5-minute break</li>
                    <li>• After 4 sessions, take a 15-minute break</li>
                    <li>• Repeat the cycle throughout your day</li>
                  </ul>
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
                {["coding", "learning", "health", "focus"].map((category) => {
                  const categoryTime = sessions
                    .filter((s) => s.category === category)
                    .reduce((acc, s) => acc + s.duration, 0)
                  const percentage = totalTimeToday > 0 ? (categoryTime / totalTimeToday) * 100 : 0

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
