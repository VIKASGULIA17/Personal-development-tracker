"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your personal growth</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Overall Progress</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Goals Achieved</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Active Streak</p>
              <p className="text-2xl font-bold">15 days</p>
              <p className="text-xs text-muted-foreground">Personal best!</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Areas to Improve</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Focus areas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Your progress across different areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Skills Development</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Health & Fitness</span>
                    <span className="text-sm text-muted-foreground">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Financial Goals</span>
                    <span className="text-sm text-muted-foreground">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning & Intelligence</span>
                    <span className="text-sm text-muted-foreground">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">7-Day Streak</p>
                    <p className="text-xs text-muted-foreground">Completed daily goals</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    New
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Skill Master</p>
                    <p className="text-xs text-muted-foreground">Completed React.js course</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Bookworm</p>
                    <p className="text-xs text-muted-foreground">Read 5 books this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Progress Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your skill development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Total Skills</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">9</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Habit Tracking</CardTitle>
              <CardDescription>Your consistency across different habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Morning Routine</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Exercise</span>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reading</span>
                  <div className="flex items-center gap-2">
                    <Progress value={90} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">90%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Achievement</CardTitle>
              <CardDescription>Track your progress towards major goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learn 3 New Skills</span>
                    <span className="text-sm text-muted-foreground">2/3</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Read 12 Books</span>
                    <span className="text-sm text-muted-foreground">8/12</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Save $10,000</span>
                    <span className="text-sm text-muted-foreground">$7,500</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
