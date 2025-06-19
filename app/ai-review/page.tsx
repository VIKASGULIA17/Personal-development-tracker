"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Star,
  Clock,
  BarChart3,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { generateAIInsights, getWeeklyData, getMonthlyData } from "@/lib/db"

export default function AIReviewPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [weeklyData, setWeeklyData] = useState(null)
  const [monthlyData, setMonthlyData] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      const [weekly, monthly] = await Promise.all([getWeeklyData(user.id), getMonthlyData(user.id)])

      setWeeklyData(weekly)
      setMonthlyData(monthly)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    if (!weeklyData || !monthlyData) return

    setIsGenerating(true)
    try {
      const insights = await generateAIInsights(weeklyData, monthlyData)
      setAiInsights(insights)
      toast({
        title: "AI Insights Generated",
        description: "Your personalized performance analysis is ready!",
      })
    } catch (error) {
      console.error("Error generating insights:", error)
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h1 className="text-2xl md:text-3xl font-bold">AI Performance Review</h1>
        </div>
        <div className="grid gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Please log in to view AI performance review</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h1 className="text-2xl md:text-3xl font-bold">AI Performance Review</h1>
        </div>
        <Button onClick={handleGenerateInsights} disabled={isGenerating} className="w-full md:w-auto">
          {isGenerating ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Generating Insights...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Insights
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklyReview data={weeklyData} />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyReview data={monthlyData} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <AIInsights insights={aiInsights} onGenerate={handleGenerateInsights} isGenerating={isGenerating} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <TaskRecommendations insights={aiInsights} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WeeklyReview({ data }) {
  if (!data) return <div>No weekly data available</div>

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overallScore}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.weeklyTrend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(data.weeklyTrend)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.goalsCompleted}</div>
            <div className="text-xs text-muted-foreground">{data.totalGoals} total goals</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeDays}</div>
            <div className="text-xs text-muted-foreground">out of 7 days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}%</div>
            <Progress value={data.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Highlights</CardTitle>
          <CardDescription>Your key achievements this week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.highlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">{highlight.title}</p>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function MonthlyReview({ data }) {
  if (!data) return <div>No monthly data available</div>

  return (
    <div className="grid gap-4 md:gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{data.overallScore}%</div>
            <Progress value={data.overallScore} className="mb-2" />
            <div className="flex items-center text-sm text-muted-foreground">
              {data.monthlyTrend > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
              )}
              {Math.abs(data.monthlyTrend)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.categories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{category.name}</span>
                  <span>{category.score}%</span>
                </div>
                <Progress value={category.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Goals</span>
              <span className="font-medium">{data.totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-medium">{data.completedGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Days</span>
              <span className="font-medium">{data.activeDays}/30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Streak</span>
              <span className="font-medium">{data.currentStreak} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Achievements</CardTitle>
          <CardDescription>Major milestones reached this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {data.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant="secondary" className="mt-1">
                    {achievement.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AIInsights({ insights, onGenerate, isGenerating }) {
  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Analysis
          </CardTitle>
          <CardDescription>Generate personalized insights based on your performance data</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Click the "Generate AI Insights" button to get your personalized analysis
          </p>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Analysis
          </CardTitle>
          <CardDescription>Personalized insights based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Overall Assessment</h3>
              <p className="text-muted-foreground">{insights.overall}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
              <ul className="space-y-1">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h3>
              <ul className="space-y-1">
                {insights.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Grade</CardTitle>
          <CardDescription>Your overall performance rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2 text-primary">{insights.grade}</div>
            <p className="text-muted-foreground">{insights.gradeDescription}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskRecommendations({ insights }) {
  if (!insights || !insights.recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Recommendations</CardTitle>
          <CardDescription>Generate AI insights first to see personalized task recommendations</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            AI-powered task suggestions will appear here after generating insights
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Tasks</CardTitle>
          <CardDescription>Personalized tasks based on your progress and goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{rec.title}</h3>
                  <Badge
                    variant={
                      rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "default" : "secondary"
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rec.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {rec.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
