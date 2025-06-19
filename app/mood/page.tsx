"use client"

import { useState, useEffect } from "react"
import { SmilePlus, TrendingUp, Calendar, Heart, Brain, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getMoodEntries, createMoodEntry } from "@/lib/db"

export default function MoodPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [currentMood, setCurrentMood] = useState(null)
  const [currentEnergy, setCurrentEnergy] = useState(null)
  const [moodNote, setMoodNote] = useState("")
  const [moodEntries, setMoodEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const moodEmojis = {
    1: "😢",
    2: "😕",
    3: "😐",
    4: "😊",
    5: "😄",
  }

  const moodLabels = {
    1: "Very Low",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Excellent",
  }

  const energyEmojis = {
    1: "🔋",
    2: "🔋",
    3: "🔋",
    4: "⚡",
    5: "⚡",
  }

  const energyLabels = {
    1: "Exhausted",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Energized",
  }

  // Fetch mood entries on component mount
  useEffect(() => {
    if (user?.id) {
      fetchMoodEntries()
    }
  }, [user])

  const fetchMoodEntries = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getMoodEntries(user.id)
      setMoodEntries(data)
    } catch (err) {
      setError("Failed to fetch mood entries")
      console.error("Error fetching mood entries:", err)
    } finally {
      setLoading(false)
    }
  }

  const logMood = async () => {
    if (!currentMood) {
      toast({
        title: "Select Mood",
        description: "Please select your current mood first",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) return

    try {
      const moodData = {
        user_id: user.id,
        mood: currentMood,
        energy_level: currentEnergy || 3, // Default to moderate energy if not selected
        note: moodNote || null,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }

      const createdEntry = await createMoodEntry(moodData)
      if (createdEntry) {
        setMoodEntries((prev) => [createdEntry, ...prev])
        setCurrentMood(null)
        setCurrentEnergy(null)
        setMoodNote("")

        toast({
          title: "Mood Logged!",
          description: `Your mood (${moodLabels[currentMood]}) and energy (${energyLabels[currentEnergy || 3]}) have been recorded`,
        })
      }
    } catch (err) {
      setError("Failed to log mood")
      console.error("Error logging mood:", err)
    }
  }

  const averageMood =
    moodEntries.length > 0
      ? (moodEntries.reduce((acc, entry) => acc + entry.mood, 0) / moodEntries.length).toFixed(1)
      : 0

  const averageEnergy =
    moodEntries.length > 0
      ? (moodEntries.reduce((acc, entry) => acc + (entry.energy_level || 3), 0) / moodEntries.length).toFixed(1)
      : 0

  const todayEntries = moodEntries.filter((entry) => entry.date === new Date().toISOString().split("T")[0]).length

  const weeklyEntries = moodEntries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return entryDate >= weekAgo
  })

  const weeklyTrend =
    weeklyEntries.length > 0
      ? (weeklyEntries.reduce((acc, entry) => acc + entry.mood, 0) / weeklyEntries.length).toFixed(1)
      : 0

  // Calculate streak (consecutive days with mood entries)
  const calculateStreak = () => {
    if (moodEntries.length === 0) return 0

    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
    const uniqueDates = [...new Set(sortedEntries.map((entry) => entry.date))]

    let streak = 0
    const today = new Date()

    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = new Date(uniqueDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const currentStreak = calculateStreak()

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
            <p className="text-lg font-semibold">Please log in to track your mood</p>
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
          <h1 className="text-2xl md:text-3xl font-bold">Mood & Energy Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Monitor your emotional well-being and energy levels
          </p>
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

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
              <SmilePlus className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Avg Mood</p>
              <p className="text-lg md:text-2xl font-bold">{averageMood}/5</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-yellow-100 dark:bg-yellow-900">
              <Zap className="h-4 w-4 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Avg Energy</p>
              <p className="text-lg md:text-2xl font-bold">{averageEnergy}/5</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-green-100 dark:bg-green-900">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Today's Logs</p>
              <p className="text-lg md:text-2xl font-bold">{todayEntries}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-purple-100 dark:bg-purple-900">
              <Heart className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Streak</p>
              <p className="text-lg md:text-2xl font-bold">{currentStreak} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Tracking */}
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="log" className="text-xs md:text-sm">
            Log Mood
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">
            History
          </TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs md:text-sm">
            Patterns
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs md:text-sm">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">How are you feeling?</CardTitle>
              <CardDescription className="text-sm">
                Select your current mood, energy level, and add any notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Current Mood</label>
                <div className="grid grid-cols-5 gap-2 md:gap-4">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <Button
                      key={mood}
                      variant={currentMood === mood ? "default" : "outline"}
                      onClick={() => setCurrentMood(mood)}
                      className="flex flex-col items-center gap-2 h-auto p-3 md:p-4"
                    >
                      <span className="text-2xl md:text-3xl">{moodEmojis[mood]}</span>
                      <span className="text-xs md:text-sm">{moodLabels[mood]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Energy Level</label>
                <div className="grid grid-cols-5 gap-2 md:gap-4">
                  {[1, 2, 3, 4, 5].map((energy) => (
                    <Button
                      key={energy}
                      variant={currentEnergy === energy ? "default" : "outline"}
                      onClick={() => setCurrentEnergy(energy)}
                      className="flex flex-col items-center gap-2 h-auto p-3 md:p-4"
                    >
                      <span className="text-2xl md:text-3xl">{energyEmojis[energy]}</span>
                      <span className="text-xs md:text-sm">{energyLabels[energy]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {(currentMood || currentEnergy) && (
                <div className="p-3 md:p-4 bg-muted rounded-lg space-y-2">
                  {currentMood && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{moodEmojis[currentMood]}</span>
                      <span className="font-medium">Mood: {moodLabels[currentMood]}</span>
                      <Progress value={currentMood * 20} className="h-2 flex-1" />
                    </div>
                  )}
                  {currentEnergy && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{energyEmojis[currentEnergy]}</span>
                      <span className="font-medium">Energy: {energyLabels[currentEnergy]}</span>
                      <Progress value={currentEnergy * 20} className="h-2 flex-1" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="What's contributing to your mood and energy today? Any specific thoughts or events?"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button onClick={logMood} className="w-full md:w-auto" disabled={!currentMood}>
                <SmilePlus className="mr-2 h-4 w-4" />
                Log Mood & Energy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood & Energy History</CardTitle>
              <CardDescription className="text-sm">Your recent mood and energy entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {moodEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl md:text-3xl">{moodEmojis[entry.mood]}</span>
                        <span className="text-lg">{energyEmojis[entry.energy_level || 3]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                          <span className="font-medium text-sm md:text-base">
                            {moodLabels[entry.mood]} • {energyLabels[entry.energy_level || 3]}
                          </span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {entry.date} at {entry.time}
                          </Badge>
                        </div>
                        {entry.note && <p className="text-xs md:text-sm text-muted-foreground mt-1">{entry.note}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Mood:</span>
                        <Progress value={entry.mood * 20} className="h-2 w-16 md:w-24" />
                        <span className="text-xs text-muted-foreground">{entry.mood}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12">Energy:</span>
                        <Progress value={(entry.energy_level || 3) * 20} className="h-2 w-16 md:w-24" />
                        <span className="text-xs text-muted-foreground">{entry.energy_level || 3}/5</span>
                      </div>
                    </div>
                  </div>
                ))}

                {moodEntries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No mood entries yet. Start tracking your mood and energy!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood & Energy Patterns</CardTitle>
              <CardDescription className="text-sm">
                Discover patterns in your emotional well-being and energy levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm md:text-base">Mood Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(moodLabels).map(([mood, label]) => {
                      const count = moodEntries.filter((entry) => entry.mood === Number.parseInt(mood)).length
                      const percentage = moodEntries.length > 0 ? (count / moodEntries.length) * 100 : 0
                      return (
                        <div key={mood} className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-20">
                            <span className="text-sm">{moodEmojis[mood]}</span>
                            <span className="text-xs">{label}</span>
                          </div>
                          <Progress value={percentage} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-12">{count} times</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm md:text-base">Energy Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(energyLabels).map(([energy, label]) => {
                      const count = moodEntries.filter(
                        (entry) => (entry.energy_level || 3) === Number.parseInt(energy),
                      ).length
                      const percentage = moodEntries.length > 0 ? (count / moodEntries.length) * 100 : 0
                      return (
                        <div key={energy} className="flex items-center gap-4">
                          <div className="flex items-center gap-2 w-20">
                            <span className="text-sm">{energyEmojis[energy]}</span>
                            <span className="text-xs">{label}</span>
                          </div>
                          <Progress value={percentage} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-12">{count} times</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood & Energy Insights</CardTitle>
              <CardDescription className="text-sm">Insights about your emotional and energy patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium text-sm md:text-base">Current Streak</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        You've been tracking your mood for {currentStreak} consecutive days.
                        {currentStreak > 0 ? " Keep up the great work!" : " Start building your streak today!"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium text-sm md:text-base">Weekly Average</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Your average mood this week is {weeklyTrend}/5 and energy is {averageEnergy}/5.
                        {weeklyTrend >= 4
                          ? " You're doing great!"
                          : weeklyTrend >= 3
                            ? " Keep working on your well-being."
                            : " Consider reaching out for support if needed."}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-sm md:text-base mb-2">💡 Recommendations</h4>
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                    <li>• Try logging your mood and energy at consistent times each day</li>
                    <li>• Note specific activities that boost your mood and energy</li>
                    <li>• Consider meditation or mindfulness practices for mood regulation</li>
                    <li>• Maintain regular sleep and exercise schedules for energy</li>
                    <li>• Track patterns between your mood and energy levels</li>
                    <li>• Reach out to friends, family, or professionals when needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
