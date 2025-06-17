"use client"

import { useState } from "react"
import { Dumbbell, Plus, TrendingUp, Target, Timer } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function StrengthPage() {
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      exercise: "Push-ups",
      sets: 3,
      reps: 15,
      weight: 0,
      category: "bodyweight",
      completed: false,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 2,
      exercise: "Bench Press",
      sets: 4,
      reps: 8,
      weight: 135,
      category: "chest",
      completed: true,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 3,
      exercise: "Squats",
      sets: 3,
      reps: 12,
      weight: 185,
      category: "legs",
      completed: false,
      date: new Date().toISOString().split("T")[0],
    },
    {
      id: 4,
      exercise: "Pull-ups",
      sets: 3,
      reps: 8,
      weight: 0,
      category: "back",
      completed: true,
      date: new Date().toISOString().split("T")[0],
    },
  ])

  const toggleWorkout = (workoutId) => {
    setWorkouts(
      workouts.map((workout) => (workout.id === workoutId ? { ...workout, completed: !workout.completed } : workout)),
    )

    const workout = workouts.find((w) => w.id === workoutId)
    toast({
      title: workout?.completed ? "Exercise Unchecked" : "Exercise Completed!",
      description: workout?.completed
        ? `${workout.exercise} marked as incomplete`
        : `Great job! ${workout?.exercise} completed`,
    })
  }

  const addNewWorkout = () => {
    toast({
      title: "Add New Exercise",
      description: "Exercise form would open here",
    })
  }

  const updateSets = (workoutId, increment = true) => {
    setWorkouts(
      workouts.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              sets: increment ? workout.sets + 1 : Math.max(1, workout.sets - 1),
            }
          : workout,
      ),
    )

    toast({
      title: "Sets Updated",
      description: increment ? "Added one set" : "Removed one set",
    })
  }

  const updateReps = (workoutId, increment = true) => {
    setWorkouts(
      workouts.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              reps: increment ? workout.reps + 1 : Math.max(1, workout.reps - 1),
            }
          : workout,
      ),
    )

    toast({
      title: "Reps Updated",
      description: increment ? "Added one rep" : "Removed one rep",
    })
  }

  const completedWorkouts = workouts.filter((w) => w.completed).length
  const totalWorkouts = workouts.length
  const totalSets = workouts.reduce((acc, w) => acc + w.sets, 0)
  const totalReps = workouts.reduce((acc, w) => acc + w.sets * w.reps, 0)

  const getCategoryColor = (category) => {
    switch (category) {
      case "chest":
        return "bg-red-500"
      case "back":
        return "bg-blue-500"
      case "legs":
        return "bg-green-500"
      case "shoulders":
        return "bg-yellow-500"
      case "arms":
        return "bg-purple-500"
      case "bodyweight":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Strength Training</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your workouts and build strength</p>
        </div>
        <Button onClick={addNewWorkout} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Completed</p>
              <p className="text-lg md:text-2xl font-bold">
                {completedWorkouts}/{totalWorkouts}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-green-100 dark:bg-green-900">
              <Dumbbell className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Total Sets</p>
              <p className="text-lg md:text-2xl font-bold">{totalSets}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-orange-100 dark:bg-orange-900">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Total Reps</p>
              <p className="text-lg md:text-2xl font-bold">{totalReps}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-purple-100 dark:bg-purple-900">
              <Timer className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Workout Time</p>
              <p className="text-lg md:text-2xl font-bold">45m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workout Tracking */}
      <Tabs defaultValue="today" className="w-full ">
        <TabsList className="grid w-full bg-zinc-100 grid-cols-4">
          <TabsTrigger value="today" className="text-xs md:text-sm">
            Today's Workout
          </TabsTrigger>
          <TabsTrigger value="chest" className="text-xs md:text-sm">
            Chest
          </TabsTrigger>
          <TabsTrigger value="back" className="text-xs md:text-sm">
            Back
          </TabsTrigger>
          <TabsTrigger value="legs" className="text-xs md:text-sm">
            Legs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Today's Workout</CardTitle>
              <CardDescription className="text-sm">Complete your planned exercises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`p-3 md:p-4 border rounded-lg transition-all ${
                      workout.completed ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={workout.completed}
                          onChange={() => toggleWorkout(workout.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h3
                              className={`font-medium text-sm md:text-base ${workout.completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {workout.exercise}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs w-fit ${getCategoryColor(workout.category)} text-white`}
                            >
                              {workout.category}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                            <span>
                              {workout.sets} sets × {workout.reps} reps
                            </span>
                            {workout.weight > 0 && <span>{workout.weight} lbs</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSets(workout.id, false)}
                            className="text-xs h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-xs px-2">Sets: {workout.sets}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSets(workout.id, true)}
                            className="text-xs h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReps(workout.id, false)}
                            className="text-xs h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-xs px-2">Reps: {workout.reps}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReps(workout.id, true)}
                            className="text-xs h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-muted rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <span className="text-sm font-medium">Workout Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedWorkouts}/{totalWorkouts} exercises
                  </span>
                </div>
                <Progress value={(completedWorkouts / totalWorkouts) * 100} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Chest Exercises</CardTitle>
              <CardDescription className="text-sm">Focus on chest development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {workouts
                  .filter((w) => w.category === "chest")
                  .map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-3 md:p-4 border rounded-lg transition-all ${
                        workout.completed ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={workout.completed}
                            onChange={() => toggleWorkout(workout.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-sm md:text-base ${workout.completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {workout.exercise}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                              <span>
                                {workout.sets} sets × {workout.reps} reps
                              </span>
                              {workout.weight > 0 && <span>{workout.weight} lbs</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Sets: {workout.sets}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Reps: {workout.reps}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="back" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Back Exercises</CardTitle>
              <CardDescription className="text-sm">Strengthen your back muscles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {workouts
                  .filter((w) => w.category === "back")
                  .map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-3 md:p-4 border rounded-lg transition-all ${
                        workout.completed ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={workout.completed}
                            onChange={() => toggleWorkout(workout.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-sm md:text-base ${workout.completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {workout.exercise}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                              <span>
                                {workout.sets} sets × {workout.reps} reps
                              </span>
                              {workout.weight > 0 && <span>{workout.weight} lbs</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Sets: {workout.sets}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Reps: {workout.reps}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Leg Exercises</CardTitle>
              <CardDescription className="text-sm">Build lower body strength</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {workouts
                  .filter((w) => w.category === "legs")
                  .map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-3 md:p-4 border rounded-lg transition-all ${
                        workout.completed ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : ""
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={workout.completed}
                            onChange={() => toggleWorkout(workout.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-sm md:text-base ${workout.completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {workout.exercise}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                              <span>
                                {workout.sets} sets × {workout.reps} reps
                              </span>
                              {workout.weight > 0 && <span>{workout.weight} lbs</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Sets: {workout.sets}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSets(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, false)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              -
                            </Button>
                            <span className="text-xs px-2">Reps: {workout.reps}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReps(workout.id, true)}
                              className="text-xs h-8 w-8 p-0"
                            >
                              +
                            </Button>
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
