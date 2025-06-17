"use client"

import { useState } from "react"
import { SmilePlus, Plus, TrendingUp, Calendar, Heart, Brain } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function MoodPage() {
  const { toast } = useToast()
  const [currentMood, setCurrentMood] = useState(null)
  const [moodNote, setMoodNote] = useState("")
  const [moodEntries, setMoodEntries] = useState([
    {
      id: 1,
      mood: 4,
      note: "Great day! Productive work session and good workout.",
      date: new Date().toISOString().split("T")[0],
      time: "14:30",
      factors: ["exercise", "productivity", "social"],
    },
    {
      id: 2,
      mood: 3,
      note: "Feeling okay, a bit tired but content.",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      time: "18:45",
      factors: ["sleep", "work"],
    },
    {
      id: 3,
      mood: 5,
      note: "Amazing day! Everything went perfectly.",
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      time: "20:15",
      factors: ["social", "achievement", "health"],
    },
  ])

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

  const moodColors = {
    1: "text-red-500",
    2: "text-orange-500",
    3: "text-yellow-500",
    4: "text-green-500",
    5: "text-blue-500",
  }

  const logMood = () => {
    if (!currentMood) {
      toast({
        title: "Select Mood",
        description: "Please select your current mood first",
        variant: "destructive",
      })
      return
    }

    const newEntry = {
      id: moodEntries.length + 1,
      mood: currentMood,
      note: moodNote,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      factors: [],
    }

    setMoodEntries([newEntry, ...moodEntries])
    setCurrentMood(null)
    setMoodNote("")

    toast({
      title: "Mood Logged!",
      description: `Your mood (${moodLabels[currentMood]}) has been recorded`,
    })
  }

  const averageMood =
    moodEntries.length > 0
      ? (moodEntries.reduce((acc, entry) => acc + entry.mood, 0) / moodEntries.length).toFixed(1)
      : 0

  const todayEntries = moodEntries.filter((entry) => entry.date === new Date().toISOString().split("T")[0]).length

  const weeklyTrend =
    moodEntries.slice(0, 7).reduce((acc, entry) => acc + entry.mood, 0) / Math.min(7, moodEntries.length)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mood Tracking</h1>
          <p className="text-sm md:text-base text-muted-foreground">Monitor your emotional well-being and patterns</p>
        </div>
        <Button onClick={() => {}} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Quick Log
        </Button>
      </div>

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
            <div className="rounded-full p-2 md:p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Weekly Trend</p>
              <p className="text-lg md:text-2xl font-bold">{weeklyTrend.toFixed(1)}/5</p>
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
              <p className="text-lg md:text-2xl font-bold">5 days</p>
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
              <CardDescription className="text-sm">Select your current mood and add any notes</CardDescription>
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

              {currentMood && (
                <div className="p-3 md:p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{moodEmojis[currentMood]}</span>
                    <span className="font-medium">You're feeling {moodLabels[currentMood]}</span>
                  </div>
                  <Progress value={currentMood * 20} className="h-2" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="What's contributing to your mood today? Any specific thoughts or events?"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button onClick={logMood} className="w-full md:w-auto" disabled={!currentMood}>
                <SmilePlus className="mr-2 h-4 w-4" />
                Log Mood
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood History</CardTitle>
              <CardDescription className="text-sm">Your recent mood entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {moodEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl md:text-3xl">{moodEmojis[entry.mood]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                          <span className="font-medium text-sm md:text-base">{moodLabels[entry.mood]}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {entry.date} at {entry.time}
                          </Badge>
                        </div>
                        {entry.note && <p className="text-xs md:text-sm text-muted-foreground mt-1">{entry.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={entry.mood * 20} className="h-2 w-16 md:w-24" />
                      <span className="text-xs text-muted-foreground">{entry.mood}/5</span>
                    </div>
                  </div>
                ))}

                {moodEntries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No mood entries yet. Start tracking your mood!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood Patterns</CardTitle>
              <CardDescription className="text-sm">Discover patterns in your emotional well-being</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm md:text-base">Weekly Overview</h4>
                    <div className="space-y-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                        const dayMood = Math.floor(Math.random() * 5) + 1
                        return (
                          <div key={day} className="flex items-center gap-4">
                            <span className="text-sm font-medium w-12">{day}</span>
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-lg">{moodEmojis[dayMood]}</span>
                              <Progress value={dayMood * 20} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground w-8">{dayMood}/5</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Mood Insights</CardTitle>
              <CardDescription className="text-sm">AI-powered insights about your emotional patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium text-sm md:text-base">Pattern Recognition</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Your mood tends to be highest on weekends and after exercise sessions. Consider incorporating
                        more physical activity during weekdays.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium text-sm md:text-base">Improvement Trend</h4>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Your average mood has improved by 15% over the past month. Keep up the great work with your
                        self-care routine!
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-sm md:text-base mb-2">💡 Recommendations</h4>
                  <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
                    <li>• Try logging your mood at consistent times each day</li>
                    <li>• Note specific activities that boost your mood</li>
                    <li>• Consider meditation or mindfulness practices</li>
                    <li>• Maintain regular sleep and exercise schedules</li>
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
