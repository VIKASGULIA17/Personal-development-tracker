"use client"

import { useState } from "react"
import { CheckSquare, Plus, Calendar, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete React project",
      description: "Finish the personal dashboard project",
      status: "in_progress",
      priority: "high",
      dueDate: "2024-01-18",
      estimatedTime: 120,
      project: "Personal Website",
      completed: false,
    },
    {
      id: 2,
      title: "Read 30 pages",
      description: "Continue reading Atomic Habits",
      status: "todo",
      priority: "medium",
      dueDate: "2024-01-16",
      estimatedTime: 45,
      project: null,
      completed: false,
    },
    {
      id: 3,
      title: "Morning workout",
      description: "Complete full body workout routine",
      status: "completed",
      priority: "high",
      dueDate: "2024-01-15",
      estimatedTime: 60,
      project: null,
      completed: true,
    },
    {
      id: 4,
      title: "Update portfolio",
      description: "Add new projects to portfolio website",
      status: "todo",
      priority: "low",
      dueDate: "2024-01-20",
      estimatedTime: 90,
      project: "Personal Website",
      completed: false,
    },
  ])

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, status: task.completed ? "todo" : "completed" }
          : task,
      ),
    )

    const task = tasks.find((t) => t.id === taskId)
    toast({
      title: task?.completed ? "Task Unchecked" : "Task Completed!",
      description: task?.completed ? `${task.title} marked as incomplete` : `Great job! ${task?.title} completed`,
    })
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

  const getStatusColor = (status) => {
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && !tasks.find((t) => t.dueDate === dueDate)?.completed
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Organize and track your daily tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

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
              <p className="text-2xl font-bold">{tasks.filter((t) => t.completed).length}</p>
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
              <p className="text-2xl font-bold">{tasks.filter((t) => isOverdue(t.dueDate)).length}</p>
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

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>Complete overview of your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${task.completed ? "opacity-60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.project && (
                          <Badge variant="outline" className="text-xs">
                            {task.project}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className={isOverdue(task.dueDate) ? "text-red-500" : ""}>{task.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimatedTime}m</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(task.status)} text-white`}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>To Do Tasks</CardTitle>
              <CardDescription>Tasks that need to be started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks
                  .filter((t) => t.status === "todo")
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.project && (
                            <Badge variant="outline" className="text-xs">
                              {task.project}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.dueDate) ? "text-red-500" : ""}>{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedTime}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Tasks</CardTitle>
              <CardDescription>Tasks currently being worked on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks
                  .filter((t) => t.status === "in_progress")
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.project && (
                            <Badge variant="outline" className="text-xs">
                              {task.project}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.dueDate) ? "text-red-500" : ""}>{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedTime}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Tasks that have been finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks
                  .filter((t) => t.completed)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg opacity-60">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium line-through">{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.project && (
                            <Badge variant="outline" className="text-xs">
                              {task.project}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{task.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedTime}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
