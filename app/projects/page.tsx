"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FolderOpen, Plus, Calendar, Users, CheckCircle, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/db"

interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: string
  progress: number
  deadline: string | null
  priority: string
  created_at: string
  updated_at: string
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form state for new/edit project
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "planning",
    progress: 0,
    deadline: "",
    priority: "medium",
  })

  // Fetch projects on component mount
  useEffect(() => {
    if (user?.id) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getProjects(user.id)
      setProjects(data)
    } catch (err) {
      setError("Failed to fetch projects")
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const projectData = {
        user_id: user.id,
        name: projectForm.name,
        description: projectForm.description || null,
        status: projectForm.status,
        progress: Number(projectForm.progress),
        deadline: projectForm.deadline || null,
        priority: projectForm.priority,
      }

      const createdProject = await createProject(projectData)
      if (createdProject) {
        setProjects((prev) => [createdProject, ...prev])
        resetForm()
        setIsAddModalOpen(false)
      }
    } catch (err) {
      setError("Failed to create project")
      console.error("Error creating project:", err)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      const updates = {
        name: projectForm.name,
        description: projectForm.description || null,
        status: projectForm.status,
        progress: Number(projectForm.progress),
        due_date: projectForm.due_date || null,
        priority: projectForm.priority,
        tasks: Number(projectForm.tasks),
        completed_tasks: Number(projectForm.completed_tasks),
      }

      const updatedProject = await updateProject(editingProject.id, updates)
      if (updatedProject) {
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)))
        resetForm()
        setEditingProject(null)
      }
    } catch (err) {
      setError("Failed to update project")
      console.error("Error updating project:", err)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      await deleteProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      setError("Failed to delete project")
      console.error("Error deleting project:", err)
    }
  }

  const resetForm = () => {
    setProjectForm({
      name: "",
      description: "",
      status: "planning",
      progress: 0,
      deadline: "",
      priority: "medium",
    })
  }

  const openEditModal = (project: Project) => {
    setProjectForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
      progress: project.progress,
      due_date: project.due_date || "",
      priority: project.priority,
      tasks: project.tasks,
      completed_tasks: project.completed_tasks,
    })
    setEditingProject(project)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "planning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
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

  const filterProjects = (status?: string) => {
    if (!status || status === "all") return projects
    if (status === "active") return projects.filter((p) => p.status === "in_progress")
    return projects.filter((p) => p.status === status)
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
            <p className="text-lg font-semibold">Please log in to view your projects</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={projectForm.status}
                    onValueChange={(value) => setProjectForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={projectForm.priority}
                    onValueChange={(value) => setProjectForm((prev) => ({ ...prev, priority: value }))}
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
                  <Label htmlFor="tasks">Total Tasks</Label>
                  <Input
                    id="tasks"
                    type="number"
                    value={projectForm.tasks}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, tasks: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="completed_tasks">Completed Tasks</Label>
                  <Input
                    id="completed_tasks"
                    type="number"
                    value={projectForm.completed_tasks}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, completed_tasks: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={projectForm.progress}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, progress: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={projectForm.due_date}
                    onChange={(e) => setProjectForm((prev) => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
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
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Completed</p>
              <p className="text-2xl font-bold">{projects.filter((p) => p.status === "completed").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">In Progress</p>
              <p className="text-2xl font-bold">{projects.filter((p) => p.status === "in_progress").length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center gap-4 p-6">
            <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">Avg Progress</p>
              <p className="text-2xl font-bold">
                {projects.length > 0
                  ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
                  : 0}
                %
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        {["all", "active", "completed", "planning"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterProjects(tabValue).length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <p className="text-lg">No projects found</p>
                  <p>Create your first project to get started!</p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterProjects(tabValue).map((project) => (
                  <Card
                    key={project.id}
                    className={`hover:shadow-md transition-shadow ${
                      project.status === "completed" ? "opacity-75" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(project)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <CardDescription>{project.description}</CardDescription>
                        <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                          {project.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />

                      <div className="flex items-center justify-between text-sm">
                        <span>Tasks</span>
                        <span>
                          {project.completed_tasks}/{project.tasks}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                          {project.status.replace("_", " ")}
                        </Badge>
                        {project.due_date && (
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(project.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Project Modal */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={projectForm.name}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Project description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={projectForm.status}
                  onValueChange={(value) => setProjectForm((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={projectForm.priority}
                  onValueChange={(value) => setProjectForm((prev) => ({ ...prev, priority: value }))}
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
                <Label htmlFor="edit-tasks">Total Tasks</Label>
                <Input
                  id="edit-tasks"
                  type="number"
                  value={projectForm.tasks}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, tasks: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-completed-tasks">Completed Tasks</Label>
                <Input
                  id="edit-completed-tasks"
                  type="number"
                  value={projectForm.completed_tasks}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, completed_tasks: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, progress: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="date"
                  value={projectForm.due_date}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
