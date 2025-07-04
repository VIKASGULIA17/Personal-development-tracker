"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Check,
  X,
  List,
  Grid3X3,
  Bell,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  getScheduleItems,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  toggleScheduleItemStatus,
  subscribeToScheduleChanges,
} from "@/lib/db"

interface ScheduleItem {
  id: string
  user_id: string
  task_name: string
  day_of_week: number
  start_time: string
  end_time: string
  notes?: string
  status: "pending" | "done" | "incomplete"
  created_at: string
  updated_at: string
}

interface ScheduleFormData {
  task_name: string
  day_of_week: number
  start_time: string
  end_time: string
  notes: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

const SchedulePage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const [formData, setFormData] = useState<ScheduleFormData>({
    task_name: "",
    day_of_week: new Date().getDay(),
    start_time: "09:00",
    end_time: "10:00",
    notes: "",
  })

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setNotificationsEnabled(permission === "granted")
        })
      }
    }
  }, [])

  // Load schedule items
  const loadScheduleItems = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const items = await getScheduleItems(user.id)
      setScheduleItems(items)
    } catch (error) {
      console.error("Error loading schedule items:", error)
      toast({
        title: "Error",
        description: "Failed to load schedule items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user?.id) return

    const channel = subscribeToScheduleChanges(user.id, (payload) => {
      console.log("Schedule change:", payload)
      loadScheduleItems()
    })

    return () => {
      if (channel && typeof channel.unsubscribe === "function") {
        channel.unsubscribe()
      }
    }
  }, [user?.id, loadScheduleItems])

  // Load initial data
  useEffect(() => {
    loadScheduleItems()
  }, [loadScheduleItems])

  // Check for upcoming tasks and send notifications
  useEffect(() => {
    if (!notificationsEnabled || scheduleItems.length === 0) return

    const checkUpcomingTasks = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      scheduleItems.forEach((item) => {
        if (item.day_of_week === currentDay && item.status === "pending") {
          const [startHour, startMinute] = item.start_time.split(":").map(Number)
          const taskStartTime = startHour * 60 + startMinute
          const minutesUntilTask = taskStartTime - currentTime

          // Notify 15 minutes before task
          if (minutesUntilTask === 15) {
            new Notification(`Upcoming Task: ${item.task_name}`, {
              body: `Starting in 15 minutes at ${item.start_time}`,
              icon: "/favicon.ico",
            })
          }
        }
      })
    }

    const interval = setInterval(checkUpcomingTasks, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [scheduleItems, notificationsEnabled])

  // Get task status with time-based logic
  const getTaskStatus = useCallback(
    (item: ScheduleItem) => {
      if (item.status === "done") return "done"

      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      if (item.day_of_week === currentDay) {
        const [endHour, endMinute] = item.end_time.split(":").map(Number)
        const taskEndTime = endHour * 60 + endMinute
        const [startHour, startMinute] = item.start_time.split(":").map(Number)
        const taskStartTime = startHour * 60 + startMinute

        // Task has ended and is still pending
        if (currentTime > taskEndTime && item.status === "pending") {
          return "overdue"
        }

        // Task ends within 60 minutes and is still pending
        if (currentTime <= taskEndTime && taskEndTime - currentTime <= 60 && item.status === "pending") {
          return "warning"
        }
      }

      return item.status
    },
    [currentTime],
  )

  // Get remaining time for a task
  const getRemainingTime = useCallback(
    (item: ScheduleItem) => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      if (item.day_of_week === currentDay) {
        const [endHour, endMinute] = item.end_time.split(":").map(Number)
        const taskEndTime = endHour * 60 + endMinute
        const minutesRemaining = taskEndTime - currentTime

        if (minutesRemaining < 0) {
          return `Overdue by ${Math.abs(minutesRemaining)} min`
        } else if (minutesRemaining <= 60) {
          return `${minutesRemaining} min remaining`
        }
      }

      return null
    },
    [currentTime],
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      if (editingItem) {
        await updateScheduleItem(editingItem.id, formData)
        toast({
          title: "Success",
          description: "Schedule item updated successfully",
        })
      } else {
        await createScheduleItem({
          ...formData,
          user_id: user.id,
        })
        toast({
          title: "Success",
          description: "Schedule item created successfully",
        })
      }

      setIsAddDialogOpen(false)
      setEditingItem(null)
      setFormData({
        task_name: "",
        day_of_week: new Date().getDay(),
        start_time: "09:00",
        end_time: "10:00",
        notes: "",
      })
      loadScheduleItems()
    } catch (error) {
      console.error("Error saving schedule item:", error)
      toast({
        title: "Error",
        description: "Failed to save schedule item",
        variant: "destructive",
      })
    }
  }

  // Handle delete
  const handleDelete = async (itemId: string) => {
    try {
      await deleteScheduleItem(itemId)
      toast({
        title: "Success",
        description: "Schedule item deleted successfully",
      })
      loadScheduleItems()
    } catch (error) {
      console.error("Error deleting schedule item:", error)
      toast({
        title: "Error",
        description: "Failed to delete schedule item",
        variant: "destructive",
      })
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (item: ScheduleItem) => {
    try {
      await toggleScheduleItemStatus(item.id, item.status)
      toast({
        title: "Success",
        description: "Task status updated successfully",
      })
      loadScheduleItems()
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  // Handle edit
  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item)
    setFormData({
      task_name: item.task_name,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      notes: item.notes || "",
    })
    setIsAddDialogOpen(true)
  }

  // Group items by day for grid view
  const itemsByDay = useMemo(() => {
    const grouped: { [key: number]: ScheduleItem[] } = {}
    DAYS_OF_WEEK.forEach((_, index) => {
      grouped[index] = scheduleItems.filter((item) => item.day_of_week === index)
    })
    return grouped
  }, [scheduleItems])

  // Get items for selected day in list view
  const selectedDayItems = useMemo(() => {
    return scheduleItems
      .filter((item) => item.day_of_week === selectedDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [scheduleItems, selectedDay])

  // Render task badge
  const renderTaskBadge = (item: ScheduleItem) => {
    const status = getTaskStatus(item)
    const remainingTime = getRemainingTime(item)

    let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default"
    let badgeText = "Pending"
    let icon = <Clock className="h-3 w-3" />

    switch (status) {
      case "done":
        badgeVariant = "default"
        badgeText = "Done"
        icon = <CheckCircle2 className="h-3 w-3 text-green-600" />
        break
      case "overdue":
        badgeVariant = "destructive"
        badgeText = "Overdue"
        icon = <AlertCircle className="h-3 w-3" />
        break
      case "warning":
        badgeVariant = "destructive"
        badgeText = "Due Soon"
        icon = <AlertCircle className="h-3 w-3" />
        break
      default:
        badgeVariant = "secondary"
        badgeText = "Pending"
        icon = <Clock className="h-3 w-3" />
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={badgeVariant}
              className={`flex items-center gap-1 ${
                status === "warning" || status === "overdue" ? "animate-pulse" : ""
              }`}
            >
              {icon}
              {badgeText}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{remainingTime || `${item.start_time} - ${item.end_time}`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Render task item
  const renderTaskItem = (item: ScheduleItem) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative"
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm truncate">{item.task_name}</h4>
                {renderTaskBadge(item)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                <span>
                  {item.start_time} - {item.end_time}
                </span>
              </div>
              {item.notes && <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusToggle(item)}
                className="h-8 w-8 p-0"
                aria-label={item.status === "done" ? "Mark as pending" : "Mark as done"}
              >
                {item.status === "done" ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(item)}
                className="h-8 w-8 p-0"
                aria-label="Edit task"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                aria-label="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">Plan and track your weekly tasks</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications Toggle */}
          {notificationsEnabled && (
            <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent">
              <Bell className="h-4 w-4 mr-2" />
              Notifications On
            </Button>
          )}

          {/* Add Task Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 px-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Task" : "Add New Task"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update your scheduled task" : "Create a new scheduled task for your week"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task_name">Task Name</Label>
                  <Input
                    id="task_name"
                    value={formData.task_name}
                    onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                    placeholder="Enter task name"
                    required
                    aria-describedby="task_name_desc"
                  />
                  <p id="task_name_desc" className="sr-only">
                    Enter a descriptive name for your task
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week">Day</Label>
                    <Select
                      value={formData.day_of_week.toString()}
                      onValueChange={(value) => setFormData({ ...formData, day_of_week: Number.parseInt(value) })}
                    >
                      <SelectTrigger id="day_of_week">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingItem(null)
                      setFormData({
                        task_name: "",
                        day_of_week: new Date().getDay(),
                        start_time: "09:00",
                        end_time: "10:00",
                        notes: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingItem ? "Update" : "Create"} Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Week
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <List className="h-4 w-4 mr-2" />
            Day
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:grid-rows-3 gap-4"
          >
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <Card key={dayIndex} className="h-auto">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{day}</span>
                    <Badge variant="outline" className="text-xs">
                      {itemsByDay[dayIndex]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <AnimatePresence>{itemsByDay[dayIndex]?.map((item) => renderTaskItem(item))}</AnimatePresence>
                  {itemsByDay[dayIndex]?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Day Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                <Button
                  key={dayIndex}
                  size="sm"
                  variant={selectedDay === dayIndex ? "default" : "outline"}
                  onClick={() => setSelectedDay(dayIndex)}
                  className="whitespace-nowrap"
                >
                  {day}
                  {itemsByDay[dayIndex]?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {itemsByDay[dayIndex].length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Selected Day Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {DAYS_OF_WEEK[selectedDay]} Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>{selectedDayItems.map((item) => renderTaskItem(item))}</AnimatePresence>
                {selectedDayItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No tasks scheduled</h3>
                    <p className="text-sm mb-4">Add your first task for {DAYS_OF_WEEK[selectedDay]}</p>
                    <Button
                      onClick={() => {
                        setFormData({ ...formData, day_of_week: selectedDay })
                        setIsAddDialogOpen(true)
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button (Mobile) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add new task</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  )
}

export default SchedulePage
