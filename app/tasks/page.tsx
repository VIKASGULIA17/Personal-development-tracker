"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckSquare, Plus, Calendar, Clock, AlertCircle, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getTasks, createTask, updateTask, deleteTask, toggleTaskCompleted, getProjects } from "@/lib/db"

interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  estimated_time: number | null
  actual_time: number | null
  created_at: string
  updated_at: string
  projects?: { name: string } | null
}

interface Project {
  id: string
  name: string
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Form state for new/edit task
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    estimated_time: "",
    project_id: "",
  })

  // Fetch tasks and projects on component mount
  useEffect(() => {
    if (user?.id) {
      fetchTasks()
      fetchProjects()
    }
  }, [user])

  const fetchTasks = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getTasks(user.id)
      setTasks(data)
    } catch (err) {
      setError("Failed to fetch tasks")
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    if (!user?.id) return

    try {
      const data = await getProjects(user.id)
      setProjects(data)
    } catch (err) {
      console.error("Error fetching projects:", err)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const taskData = {
        user_id: user.id,
        title: taskForm.title,
        description: taskForm.description || null,
        status: taskForm.status,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        estimated_time: taskForm.estimated_time ? Number(taskForm.estimated_time) : null,
        project_id: taskForm.project_id || null,
      }

      const createdTask = await createTask(taskData)
      if (createdTask) {
        setTasks((prev) => [createdTask, ...prev])
        resetForm()
        setIsAddModalOpen(false)
      }
    } catch (err) {
      setError("Failed to create task")
      console.error("Error creating task:", err)
    }
  }

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    try {
      const updates = {
        title: taskForm.title,
        description: taskForm.description || null,
        status: taskForm.status,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        estimated_time: taskForm.estimated_time ? Number(taskForm.estimated_time) : null,
        project_id: taskForm.project_id || null,
      }

      const updatedTask = await updateTask(editingTask.id, updates)
      if (updatedTask) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updatedTask : t)))
        resetForm()
        setEditingTask(null)
      }
    } catch (err) {
      setError("Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      await deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (err) {
      setError("Failed to delete task")
      console.error("Error deleting task:", err)
    }
  }

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    try {
      const updatedTask = await toggleTaskCompleted(taskId, task.status === "completed")
      if (updatedTask) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      }
    } catch (err) {
      setError("Failed to update task")
      console.error("Error updating task:", err)
    }
  }

  const resetForm = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      estimated_time: "",
      project_id: "",
    })
  }

  const openEditModal = (task: Task) => {
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || "",
      estimated_time: task.estimated_time?.toString() || "",
      project_id: task.project_id || "",
    })
    setEditingTask(task)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "todo":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && tasks.find((t) => t.due_date === dueDate)?.status !== "completed"
  }

  const filterTasks = (status?: string) => {
    if (!status || status === "all") return tasks
    return tasks.filter((t) => t.status === status)
  }

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
            <p className="text-lg font-semibold">Please log in to view your tasks</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Organize and track your daily tasks</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to organize your work and track progress.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={taskForm.status}
                    onValueChange={(value) => setTaskForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value) => setTaskForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    value={taskForm.estimated_time}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, estimated_time: e.target.value }))}
                    placeholder="60"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project_id">Project (Optional)</Label>
                <Select
                  value={taskForm.project_id}
                  onValueChange={(value) => setTaskForm((prev) => ({ ...prev, project_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
              <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Total Tasks</p>
              <p className="text-2xl font-bold">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Completed</p>
              <p className="text-2xl font-bold">{tasks.filter((t) => t.status === "completed").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">In Progress</p>
              <p className="text-2xl font-bold">{tasks.filter((t) => t.status === "in_progress").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Overdue</p>
              <p className="text-2xl font-bold">{tasks.filter((t) => isOverdue(t.due_date)).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {["all", "todo", "in_progress", "completed"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterTasks(tabValue).length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <p className="text-lg">No tasks found</p>
                  <p>Create your first task to get started!</p>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {tabValue === "all"
                      ? "All Tasks"
                      : tabValue === "todo"
                        ? "To Do Tasks"
                        : tabValue === "in_progress"
                          ? "In Progress Tasks"
                          : "Completed Tasks"}
                  </CardTitle>
                  <CardDescription>
                    {tabValue === "all"
                      ? "Complete overview of your tasks"
                      : tabValue === "todo"
                        ? "Tasks that need to be started"
                        : tabValue === "in_progress"
                          ? "Tasks currently being worked on"
                          : "Tasks that have been finished"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
  {filterTasks(tabValue).map((task) => (
    <div
      key={task.id}
      className={`p-4 border rounded-lg bg-white dark:bg-background shadow-sm space-y-3 ${
        task.status === "completed" ? "opacity-70" : ""
      }`}
    >
      {/* Top Row: Title + Priority + Project */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.status === "completed"}
            onChange={() => handleToggleTask(task.id)}
            className="w-4 h-4 mt-1 accent-blue-600"
          />
          <div className="space-y-1">
            <h3 className={`font-medium text-base ${task.status === "completed" ? "line-through" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <Badge variant={getPriorityColor(task.priority)} className="text-xs capitalize">
            {task.priority}
          </Badge>
          {task.projects?.name && (
            <Badge variant="outline" className="text-xs">
              {task.projects.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Bottom Row: Meta info */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex gap-4">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue(task.due_date) ? "text-red-500 font-medium" : ""}>
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {task.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimated_time}m</span>
            </div>
          )}
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${getStatusColor(task.status)} text-white text-xs`}>
            {task.status.replace("_", " ")}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(task)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTask(task.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>

                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Task Modal */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details and track progress.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(value) => setTaskForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(value) => setTaskForm((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-estimated-time">Estimated Time (minutes)</Label>
                <Input
                  id="edit-estimated-time"
                  type="number"
                  value={taskForm.estimated_time}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, estimated_time: e.target.value }))}
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-project-id">Project (Optional)</Label>
              <Select
                value={taskForm.project_id}
                onValueChange={(value) => setTaskForm((prev) => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
