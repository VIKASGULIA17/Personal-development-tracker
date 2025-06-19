"use client"

import { useState, useEffect } from "react"
import { Heart, Activity, Droplets, Moon, Plus, TrendingUp, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getHealthEntries, createHealthEntry, updateHealthEntry } from "@/lib/db"
import { useAuth } from "@/lib/auth-context" // Assuming you have auth context

export default function HealthPage() {
  const { toast } = useToast()
  const { user } = useAuth() // Get current user
  const [healthMetrics, setHealthMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Default targets for each metric type
  const defaultTargets = {
    water: 8,
    sleep: 8,
    steps: 10000,
    heart_rate: 70
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Fetch health data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchHealthData()
    }
  }, [user?.id])
  
  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const data = await getHealthEntries(user.id, today)
      
      // Transform database data to match component structure
      const transformedData = transformHealthData(data)
      setHealthMetrics(transformedData)
    } catch (error) {
      console.error('Error fetching health data:', error)
      toast({
        title: "Error",
        description: "Failed to load health data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const transformHealthData = (dbData) => {
    // Group data by type and get the latest entry for each type
    const groupedData = dbData.reduce((acc, entry) => {
      if (!acc[entry.type] || new Date(entry.created_at) > new Date(acc[entry.type].created_at)) {
        acc[entry.type] = entry
      }
      return acc
    }, {})

    // Create metrics array with default values for missing types
    const metricTypes = ['water', 'sleep', 'steps', 'heart_rate']
    
    return metricTypes.map(type => {
      const dbEntry = groupedData[type]
      return {
        id: dbEntry?.id || `temp-${type}`,
        type,
        value: dbEntry?.value || 0,
        target: defaultTargets[type],
        unit: getUnit(type),
        date: today,
        isFromDb: !!dbEntry
      }
    })
  }

  const getUnit = (type) => {
    switch (type) {
      case "water": return "glasses"
      case "sleep": return "hours"
      case "steps": return "steps"
      case "heart_rate": return "bpm"
      default: return ""
    }
  }

  const updateMetric = async (metricId, increment = true) => {
    try {
      setUpdating(true)
      const metric = healthMetrics.find(m => m.id === metricId)
      if (!metric) return

      const incrementValue = getIncrementValue(metric.type)
      const newValue = increment 
        ? metric.value + incrementValue
        : Math.max(0, metric.value - incrementValue)

      let updatedEntry

      if (metric.isFromDb && metric.id !== `temp-${metric.type}`) {
        // Update existing entry
        const { data, error } = await updateHealthEntry(metric.id, {
          value: newValue,
          date: today
        })
        
        if (error) throw error
        updatedEntry = data[0]
      } else {
        // Create new entry
        const entryData = {
          user_id: user.id,
          type: metric.type,
          value: newValue,
          unit: metric.unit,
          date: today
        }
        
        updatedEntry = await createHealthEntry(entryData)
      }

      // Update local state
      setHealthMetrics(metrics =>
        metrics.map(m =>
          m.id === metricId
            ? { 
                ...m, 
                value: newValue, 
                id: updatedEntry.id,
                isFromDb: true 
              }
            : m
        )
      )

      toast({
        title: increment ? "Metric Updated" : "Metric Decreased",
        description: `${metric.type.replace('_', ' ')} ${increment ? "increased" : "decreased"}`,
      })
    } catch (error) {
      console.error('Error updating metric:', error)
      toast({
        title: "Error",
        description: "Failed to update metric",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const getIncrementValue = (type) => {
    switch (type) {
      case "water": return 1
      case "sleep": return 0.5
      case "steps": return 500
      case "heart_rate": return 1
      default: return 1
    }
  }

  const addNewMetric = () => {
    toast({
      title: "Add Health Metric",
      description: "Health metric form would open here",
    })
  }

  const getIcon = (type) => {
    switch (type) {
      case "water":
        return <Droplets className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
      case "sleep":
        return <Moon className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
      case "steps":
        return <Activity className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
      case "heart_rate":
        return <Heart className="h-4 w-4 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
      default:
        return <Activity className="h-4 w-4 md:h-6 md:w-6" />
    }
  }

  const getProgress = (metric) => {
    return Math.min((metric.value / metric.target) * 100, 100)
  }

  const averageProgress = healthMetrics.length > 0 
    ? Math.round(healthMetrics.reduce((acc, metric) => acc + getProgress(metric), 0) / healthMetrics.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading health data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Health</h1>
          <p className="text-sm md:text-base text-muted-foreground">Monitor your health metrics and wellness</p>
        </div>
        <Button onClick={addNewMetric} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Metric
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
              <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">{getIcon(metric.type)}</div>
              <div className="text-center md:text-left flex-1">
                <p className="text-xs md:text-sm font-medium leading-none capitalize">
                  {metric.type.replace("_", " ")}
                </p>
                <p className="text-lg md:text-2xl font-bold">
                  {metric.type === 'steps' ? metric.value.toLocaleString() : metric.value} {metric.unit}
                </p>
                <Progress value={getProgress(metric)} className="h-1 md:h-2 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Tracking */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="text-xs md:text-sm">
            Today
          </TabsTrigger>
          <TabsTrigger value="water" className="text-xs md:text-sm">
            Water
          </TabsTrigger>
          <TabsTrigger value="sleep" className="text-xs md:text-sm">
            Sleep
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs md:text-sm">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Today's Health Overview</CardTitle>
              <CardDescription className="text-sm">Track your daily health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-primary">{averageProgress}%</div>
                        <p className="text-xs md:text-sm text-muted-foreground">Overall Progress</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-green-600">
                          {healthMetrics.filter((m) => getProgress(m) >= 100).length}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">Goals Achieved</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {healthMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-full p-2 bg-gray-100 dark:bg-gray-800">{getIcon(metric.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm md:text-base capitalize">
                            {metric.type.replace("_", " ")}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={getProgress(metric)} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {metric.type === 'steps' ? metric.value.toLocaleString() : metric.value}/{metric.target} {metric.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMetric(metric.id, false)}
                          disabled={updating}
                          className="text-xs"
                        >
                          -
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateMetric(metric.id, true)} 
                          disabled={updating}
                          className="text-xs ml-36 md:m-auto"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="water" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Water Intake</CardTitle>
              <CardDescription className="text-sm">Track your daily hydration</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const waterMetric = healthMetrics.find((m) => m.type === "water")
                return (
                  <div className="space-y-4 md:space-y-6">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-bold text-blue-600 mb-2">{waterMetric?.value || 0}</div>
                      <p className="text-sm md:text-base text-muted-foreground">glasses of water today</p>
                      <Progress
                        value={waterMetric ? getProgress(waterMetric) : 0}
                        className="h-3 md:h-4 mt-4 max-w-md mx-auto"
                      />
                      <p className="text-xs md:text-sm text-muted-foreground mt-2">
                        Goal: {waterMetric?.target || 8} glasses
                      </p>
                    </div>

                    <div className="flex justify-center gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => waterMetric && updateMetric(waterMetric.id, false)}
                        disabled={updating}
                        className="w-full md:w-auto"
                      >
                        Remove Glass
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => waterMetric && updateMetric(waterMetric.id, true)}
                        disabled={updating}
                        className="w-full md:w-auto"
                      >
                        <Droplets className="mr-2 h-4 w-4" />
                        Add Glass
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Sleep Tracking</CardTitle>
              <CardDescription className="text-sm">Monitor your sleep patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const sleepMetric = healthMetrics.find((m) => m.type === "sleep")
                return (
                  <div className="space-y-4 md:space-y-6">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-bold text-purple-600 mb-2">
                        {sleepMetric?.value || 0}h
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">hours of sleep last night</p>
                      <Progress
                        value={sleepMetric ? getProgress(sleepMetric) : 0}
                        className="h-3 md:h-4 mt-4 max-w-md mx-auto"
                      />
                      <p className="text-xs md:text-sm text-muted-foreground mt-2">
                        Goal: {sleepMetric?.target || 8} hours
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-lg md:text-xl font-bold">11:00 PM</div>
                          <p className="text-xs md:text-sm text-muted-foreground">Bedtime</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-lg md:text-xl font-bold">7:00 AM</div>
                          <p className="text-xs md:text-sm text-muted-foreground">Wake Time</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-lg md:text-xl font-bold">85%</div>
                          <p className="text-xs md:text-sm text-muted-foreground">Sleep Quality</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Physical Activity</CardTitle>
              <CardDescription className="text-sm">Track your daily movement and exercise</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const stepsMetric = healthMetrics.find((m) => m.type === "steps")
                const heartRateMetric = healthMetrics.find((m) => m.type === "heart_rate")
                return (
                  <div className="space-y-4 md:space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                            {stepsMetric?.value?.toLocaleString() || 0}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">Steps Today</p>
                          <Progress value={stepsMetric ? getProgress(stepsMetric) : 0} className="h-2 mt-2" />
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">
                            {heartRateMetric?.value || 0}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">Avg Heart Rate</p>
                          <Badge variant="outline" className="mt-2">
                            {heartRateMetric && heartRateMetric.value < 80 ? "Good" : "Monitor"}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={() => stepsMetric && updateMetric(stepsMetric.id, true)}
                        disabled={updating}
                        className="w-full md:w-auto"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Log Activity
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}