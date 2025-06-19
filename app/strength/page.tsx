"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit2, Plus, Minus, Calendar, Clock, Weight, LogIn,Dumbbell  , TrendingUp, Target, Timer } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getExercises, createExercise, updateExercise, deleteExercise, updateExerciseField } from "@/lib/db"
import { supabase } from "@/lib/supabase"

interface Exercise {
  id: string
  user_id: string
  exercise: string
  sets: number | null
  reps: number | null
  weight: number | null
  duration: number | null
  date: string
  notes: string | null
  created_at: string
  category: string
  completed: boolean
  completed_at: string | null
  start_time: string | null
  end_time: string | null
}

export default function ExercisePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [Totalreps, setTotalreps] = useState(0)
  const [Totalsets, setTotalsets] = useState(0)
  const [Completed, setCompleted] = useState(0)
  const [TotalExercise, setTotalExercise] = useState(0)
  const [TotalWorkOutTime, setTotalWorkOutTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<string | null>(null)

  // Form state for new exercise
  const [newExercise, setNewExercise] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
    duration: "",
    category: "general",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Auto-login on component mount if not authenticated
  useEffect(() => {
    const total = exercises.reduce((acc, curr) => acc + curr.sets, 0)
    setTotalsets(total)
  }, [exercises])

  useEffect(() => {
    const total = exercises.reduce((acc, curr) =>acc+1, 0)
    setTotalExercise(total)
  }, [exercises])

  useEffect(() => {
  const total = exercises.reduce((acc, curr) => acc + curr.reps, 0)
  setTotalreps(total)
}, [exercises])


useEffect(() => {
  const total = exercises.reduce((acc, curr) => acc + curr.completed, 0)
  setCompleted(total)
}, [exercises])

useEffect(() => {
  const total = exercises.reduce((acc, curr) => acc + curr.duration, 0)
  setTotalWorkOutTime(total)
}, [exercises])

  useEffect(() => {
    if (!authLoading && !user) {
      handleAutoLogin()
    }
  }, [authLoading, user])

  // Fetch exercises when user is available
  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchExercises()
    } else if (!authLoading && !user) {
      setLoading(false)
      setExercises([])
    }
  }, [authLoading, user])

  
  const fetchExercises = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getExercises(user.id)
      setExercises(data)
    } catch (err) {
      setError("Failed to fetch exercises")
      console.error("Error fetching exercises:", err)
    } finally {
      setLoading(false)
    }
  }

  

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault()
   

    try {
      const exerciseData = {
        user_id: user.id,
        exercise: newExercise.exercise,
        sets: newExercise.sets ? Number.parseInt(newExercise.sets) : null,
        reps: newExercise.reps ? Number.parseInt(newExercise.reps) : null,
        weight: newExercise.weight ? Number.parseFloat(newExercise.weight) : null,
        duration: newExercise.duration ? Number.parseInt(newExercise.duration) : null,
        category: newExercise.category,
        notes: newExercise.notes || null,
        date: newExercise.date,
        completed: false,
      }

      const createdExercise = await createExercise(exerciseData)
      if (createdExercise) {
        setExercises((prev) => [...prev, createdExercise])
        setNewExercise({
          exercise: "",
          sets: "",
          reps: "",
          weight: "",
          duration: "",
          category: "general",
          notes: "",
          date: new Date().toISOString().split("T")[0],
        })
        setIsAddModalOpen(false)
        setError(null)
      }
    } catch (err) {
      setError("Failed to add exercise. Please make sure you're logged in.")
      console.error("Error adding exercise:", err)
    }
  }

  const handleUpdateField = async (exerciseId: string, field: string, increment: boolean) => {
    if (!user?.id) return

    try {
      const updatedExercise = await updateExerciseField(user.id, exerciseId, field, increment)
      if (updatedExercise) {
        setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? updatedExercise : ex)))
      }
    } catch (err) {
      setError(`Failed to update ${field}`)
      console.error(`Error updating ${field}:`, err)
    }
  }

  const handleToggleCompleted = async (exerciseId: string, currentCompleted: boolean) => {
    if (!user?.id) return

    try {
      const updatedExercise = await updateExercise(user.id, exerciseId, {
        completed: !currentCompleted,
        completed_at: !currentCompleted ? new Date().toISOString() : null,
      })
      if (updatedExercise) {
        setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? updatedExercise : ex)))
      }
    } catch (err) {
      setError("Failed to update exercise status")
      console.error("Error updating exercise status:", err)
    }
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user?.id || !confirm("Are you sure you want to delete this exercise?")) return

    try {
      const success = await deleteExercise(user.id, exerciseId)
      if (success) {
        setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
      }
    } catch (err) {
      setError("Failed to delete exercise")
      console.error("Error deleting exercise:", err)
    }
  }

  const handleInlineEdit = async (exerciseId: string, field: string, value: string) => {
    if (!user?.id) return

    try {
      let processedValue: any = value
      if (field === "sets" || field === "reps" || field === "duration") {
        processedValue = value ? Number.parseInt(value) : null
      } else if (field === "weight") {
        processedValue = value ? Number.parseFloat(value) : null
      }

      const updatedExercise = await updateExercise(user.id, exerciseId, {
        [field]: processedValue,
      })
      if (updatedExercise) {
        setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? updatedExercise : ex)))
      }
      setEditingExercise(null)
    } catch (err) {
      setError(`Failed to update ${field}`)
      console.error(`Error updating ${field}:`, err)
    }
  }

 
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Strength Training</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your workouts and build strength</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Exercise</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExercise} className="space-y-4">
                <div>
                  <Label htmlFor="exercise">Exercise Name</Label>
                  <Input
                    id="exercise"
                    value={newExercise.exercise}
                    onChange={(e) => setNewExercise((prev) => ({ ...prev, exercise: e.target.value }))}
                    placeholder="e.g., Push-ups, Squats"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sets">Sets</Label>
                    <Input
                      id="sets"
                      type="number"
                      value={newExercise.sets}
                      onChange={(e) => setNewExercise((prev) => ({ ...prev, sets: e.target.value }))}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    
                    <Label htmlFor="reps">Reps</Label>
                    <Input
                      id="reps"
                      type="number"
                      value={newExercise.reps}
                      onChange={(e) => setNewExercise((prev) => ({ ...prev, reps: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={newExercise.weight}
                      onChange={(e) => setNewExercise((prev) => ({ ...prev, weight: e.target.value }))}
                      placeholder="135.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newExercise.duration}
                      onChange={(e) => setNewExercise((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExercise.category}
                    onValueChange={(value) => setNewExercise((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExercise.date}
                    onChange={(e) => setNewExercise((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newExercise.notes}
                    onChange={(e) => setNewExercise((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Exercise</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    {<div className="grid gap-4 grid-cols-2 lg:grid-cols-4 py-4">
            <Card>
              <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
                <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
                  <Target className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium leading-none">Completed</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {Completed}/{TotalExercise}
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
                  <p className="text-lg md:text-2xl font-bold">{Totalsets}</p>
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
                  <p className="text-lg md:text-2xl font-bold">{Totalreps}</p>
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
                  <p className="text-lg md:text-2xl font-bold">{TotalWorkOutTime}</p>
                </div>
              </CardContent>
            </Card>
          </div>}
      {exercises.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <p className="text-lg">No exercises found</p>
            <p>Add your first exercise to get started!</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className={`transition-all duration-200 hover:shadow-lg ${exercise.completed ? "bg-green-100 border-green-200" : "bg-purple-50"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {editingExercise === `${exercise.id}-exercise` ? (
                      <Input
                        defaultValue={exercise.exercise}
                        onBlur={(e) => handleInlineEdit(exercise.id, "exercise", e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleInlineEdit(exercise.id, "exercise", e.currentTarget.value)
                          }
                        }}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditingExercise(`${exercise.id}-exercise`)}
                        className="cursor-pointer hover:text-blue-600"
                      >
                        {exercise.exercise}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingExercise(editingExercise ? null : `${exercise.id}-exercise`)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(exercise.date).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{exercise.category}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sets and Reps */}
                {(exercise.sets !== null || exercise.reps !== null) && (
                  <div className="grid grid-cols-1 gap-2">
                    {exercise.sets !== null && (
                      <div className="flex items-center justify-left">
                        <span className="text-sm font-medium pr-10">Sets:</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateField(exercise.id, "sets", false)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{exercise.sets}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateField(exercise.id, "sets", true)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {exercise.reps !== null && (
                      <div className="flex items-center justify-left">
                        <span className="text-sm font-medium pr-9">Reps:</span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateField(exercise.id, "reps", false)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{exercise.reps}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateField(exercise.id, "reps", true)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Weight and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  {exercise.weight !== null && (
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{exercise.weight} lbs</span>
                    </div>
                  )}
                  {exercise.duration !== null && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{exercise.duration} min</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {exercise.notes && <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{exercise.notes}</div>}

                {/* Completed Toggle */}
                <Button
                  onClick={() => handleToggleCompleted(exercise.id, exercise.completed)}
                  className={`w-full ${
                    exercise.completed ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {exercise.completed ? "Completed ✓" : "Mark Complete"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
