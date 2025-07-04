"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Circle,
  Grip,
  Brain,
  Dumbbell,
  Heart,
  DollarSign,
  BookOpen,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  getDailyActivities,
  createTask,
  createSkill,
  createFinanceEntry,
  createDisciplineEntry,
  createTimeSession,
  createMoodEntry,
} from "@/lib/db"
import { formatDate } from "@/lib/utils"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"


// Sortable Item Component
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <Grip className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

export default function DailyPage({ date }: { date: string }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activities, setActivities] = useState({
    tasks: [],
    skills: [],
    finance: [],
    intelligence: [],
    health: [],
    strength: [],
    mood: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addActivityType, setAddActivityType] = useState("task")
  const [formData, setFormData] = useState({})

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    loadActivities()
  }, [user, date])

  const loadActivities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getDailyActivities(user.id, date)
      setActivities(data)
    } catch (error) {
      console.error("Error loading activities:", error)
      toast({
        title: "Error",
        description: "Failed to load daily activities",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event, category) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setActivities((prev) => {
        const items = prev[category]
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return {
          ...prev,
          [category]: arrayMove(items, oldIndex, newIndex),
        }
      })
    }
  }

  const handleAddActivity = async () => {
    if (!user) return

    try {
      let newActivity
      const baseData = { user_id: user.id, ...formData }

      switch (addActivityType) {
        case "task":
          newActivity = await createTask({
            ...baseData,
            status: "todo",
            due_date: date,
          })
          setActivities((prev) => ({
            ...prev,
            tasks: [...prev.tasks, newActivity],
          }))
          break

        case "skill":
          newActivity = await createSkill(baseData)
          setActivities((prev) => ({
            ...prev,
            skills: [...prev.skills, newActivity],
          }))
          break

        case "finance":
          newActivity = await createFinanceEntry(baseData)
          setActivities((prev) => ({
            ...prev,
            finance: [...prev.finance, newActivity],
          }))
          break

        case "discipline":
          newActivity = await createDisciplineEntry({
            ...baseData,
            date: date,
          })
          setActivities((prev) => ({
            ...prev,
            intelligence: [...prev.intelligence, newActivity],
          }))
          break

        case "time":
          newActivity = await createTimeSession(user.id, {
            activity: formData.name,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
            duration: 60,
            category: formData.category || "work",
            description: formData.description,
          })
          setActivities((prev) => ({
            ...prev,
            health: [...prev.health, newActivity],
          }))
          break

        case "mood":
          newActivity = await createMoodEntry(user.id, {
            mood: formData.mood || 5,
            energyLevel: formData.energy_level || 5,
            notes: formData.notes,
            date: date,
          })
          setActivities((prev) => ({
            ...prev,
            mood: [...prev.mood, newActivity],
          }))
          break

        default:
          throw new Error("Invalid activity type")
      }

      toast({
        title: "Success",
        description: `${addActivityType} added successfully!`,
      })

      setIsAddDialogOpen(false)
      setFormData({})
    } catch (error) {
      console.error("Error adding activity:", error)
      toast({
        title: "Error",
        description: `Failed to add ${addActivityType}`,
        variant: "destructive",
      })
    }
    

  }

  const getActivityIcon = (type) => {
    const icons = {
      tasks: Target,
      skills: BookOpen,
      finance: DollarSign,
      intelligence: Brain,
      health: Heart,
      strength: Dumbbell,
      mood: Heart,
    }
    return icons[type] || Circle
  }

  const getActivityColor = (type) => {
    const colors = {
      tasks: "bg-blue-500/10 text-blue-600 border-blue-200",
      skills: "bg-green-500/10 text-green-600 border-green-200",
      finance: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      intelligence: "bg-purple-500/10 text-purple-600 border-purple-200",
      health: "bg-red-500/10 text-red-600 border-red-200",
      strength: "bg-orange-500/10 text-orange-600 border-orange-200",
      mood: "bg-pink-500/10 text-pink-600 border-pink-200",
    }
    return colors[type] || "bg-gray-500/10 text-gray-600 border-gray-200"
  }

  const calculateDayScore = () => {
    const totalActivities = Object.values(activities).flat().length
    const completedActivities = Object.values(activities)
      .flat()
      .filter((activity) => activity.completed || activity.status === "completed").length

    return totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
  }

  const renderActivityCard = (activity, type) => {
    const Icon = getActivityIcon(type)
    const isCompleted = activity.completed || activity.status === "completed"

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getActivityColor(type)} ${
          isCompleted ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{activity.name || activity.title || activity.activity}</h4>
              {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
              {activity.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={activity.progress} className="h-2" />
                  <span className="text-xs text-muted-foreground">{activity.progress}% complete</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
            <Badge variant="secondary" className="text-xs">
              {type}
            </Badge>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderActivityList = (type, items) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No {type} for today</p>
        </div>
      )
    }

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleDragEnd(event, type)}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((activity) => (
                <SortableItem key={activity.id} id={activity.id}>
                  {renderActivityCard(activity, type)}
                </SortableItem>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-6 bg-white/80 backdrop-blur-xl border-white/20">
            <div className="text-center">
              <p className="text-lg font-semibold">Please log in to view daily activities</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const dayScore = calculateDayScore()
  const totalActivities = Object.values(activities).flat().length
  const completedActivities = Object.values(activities)
    .flat()
    .filter((activity) => activity.completed || activity.status === "completed").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Daily Overview
              </h1>
              <p className="text-muted-foreground">
  {new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}
</p>

            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>Create a new activity for {formatDate(date)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select value={addActivityType} onValueChange={setAddActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="discipline">Discipline</SelectItem>
                      <SelectItem value="time">Time Session</SelectItem>
                      <SelectItem value="mood">Mood Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Activity name"
                  />
                </div>

                {addActivityType !== "mood" && (
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Activity description"
                    />
                  </div>
                )}

                {(addActivityType === "skill" || addActivityType === "finance") && (
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="Category"
                    />
                  </div>
                )}

                {addActivityType === "mood" && (
                  <>
                    <div>
                      <Label htmlFor="mood">Mood (1-10)</Label>
                      <Input
                        id="mood"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.mood || 5}
                        onChange={(e) => setFormData((prev) => ({ ...prev, mood: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="energy">Energy Level (1-10)</Label>
                      <Input
                        id="energy"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.energy_level || 5}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, energy_level: Number.parseInt(e.target.value) }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="How are you feeling?"
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity}>Add Activity</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Day Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dayScore}%</div>
              <Progress value={dayScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities}</div>
              <p className="text-xs text-muted-foreground">Tracked today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedActivities}</div>
              <p className="text-xs text-muted-foreground">Activities done</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActivities - completedActivities}</div>
              <p className="text-xs text-muted-foreground">To complete</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-white/50 backdrop-blur-xl">
              <TabsTrigger value="overview">All</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              <TabsTrigger value="intelligence">Mind</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="strength">Fitness</TabsTrigger>
              <TabsTrigger value="mood">Mood</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {Object.entries(activities).map(
                ([type, items]) =>
                  items.length > 0 && (
                    <motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 capitalize">
                            {React.createElement(getActivityIcon(type), { className: "h-5 w-5" })}
                            {type} ({items.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>{renderActivityList(type, items)}</CardContent>
                      </Card>
                    </motion.div>
                  ),
              )}
            </TabsContent>

            {Object.entries(activities).map(([type, items]) => (
              <TabsContent key={type} value={type}>
                <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {React.createElement(getActivityIcon(type), { className: "h-5 w-5" })}
                      {type}
                    </CardTitle>
                    <CardDescription>
                      Manage your {type} for {formatDate(date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>{renderActivityList(type, items)}</CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
