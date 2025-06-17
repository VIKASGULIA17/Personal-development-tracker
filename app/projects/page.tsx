"use client"

import { useState } from "react"
import { FolderOpen, Plus, Calendar, Users, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjectsPage() {
  const [projects] = useState([
    {
      id: 1,
      name: "Personal Website",
      description: "Build a portfolio website with Next.js",
      status: "in_progress",
      progress: 75,
      dueDate: "2024-02-15",
      priority: "high",
      tasks: 12,
      completedTasks: 9,
    },
    {
      id: 2,
      name: "Mobile App",
      description: "React Native fitness tracking app",
      status: "planning",
      progress: 25,
      dueDate: "2024-03-30",
      priority: "medium",
      tasks: 20,
      completedTasks: 5,
    },
    {
      id: 3,
      name: "Blog Platform",
      description: "Content management system for blogging",
      status: "completed",
      progress: 100,
      dueDate: "2024-01-10",
      priority: "low",
      tasks: 15,
      completedTasks: 15,
    },
  ])

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

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
                {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
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

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                      {project.priority}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
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
                      {project.completedTasks}/{project.tasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                      {project.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Due: {project.dueDate}</span>
                  </div>

                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "in_progress")
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
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
                        {project.completedTasks}/{project.tasks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                        {project.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Due: {project.dueDate}</span>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "completed")
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
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
                        {project.completedTasks}/{project.tasks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                        {project.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Due: {project.dueDate}</span>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.status === "planning")
              .map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
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
                        {project.completedTasks}/{project.tasks}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                        {project.status.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Due: {project.dueDate}</span>
                    </div>

                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
