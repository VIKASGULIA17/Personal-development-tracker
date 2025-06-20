import { supabase } from "./supabase"




// Helper function to check if user is demo user
// lib/db.js

// 🚀 Get all skills for a user
export async function getSkills(userId) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data
}

// 🚀 Create a new skill
export async function createSkill(userId, skill) {
  if (!userId || typeof userId !== "string") throw new Error("Invalid userId")
  if (typeof skill !== "object") throw new Error("Invalid skill data")

  const { data, error } = await supabase
    .from("skills")
    .insert([{ ...skill, user_id: userId }])
    .select()
    .single()

  if (error) throw error
  return data
}


// 🚀 Update an existing skill
export async function updateSkill(skillId, updates) {
  const updated_at = new Date().toISOString()

  const { data: updatedSkill, error } = await supabase
    .from("skills")
    .update({ ...updates, updated_at })
    .eq("id", skillId)
    .select()
    .single()

  if (error) throw error

  // ✅ Log progress if it was included in updates
  if ("progress" in updates) {
    await supabase.from("skill_progress_log").insert({
      skill_id: skillId,
      user_id: updatedSkill.user_id,
      progress: updates.progress,
    })
  }

  return updatedSkill
}


// 🚀 Delete a skill
export async function deleteSkill(skillId) {
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", skillId)

  if (error) throw error
}


export async function getIntelligenceItems(userId) {
  const { data, error } = await supabase
    .from("intelligence")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Supabase fetch error:", error)
    throw new Error("Could not load learning materials.")
  }

  return data
}

export async function createIntelligenceItem(itemData) {
  const { data, error } = await supabase
    .from("intelligence")
    .insert([itemData])
    .select()

  if (error) {
    console.error("Supabase insert error:", error)
    throw new Error("Could not add learning material.")
  }

  return data[0]
}

export async function updateIntelligenceItem(itemId, updates) {
  const { data, error } = await supabase
    .from("intelligence")
    .update({ ...updates, updated_at: new Date() })
    .eq("id", itemId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteIntelligenceItem(itemId) {
  const { error } = await supabase
    .from("intelligence")
    .delete()
    .eq("id", itemId)

  if (error) throw error
  return true
}
//finance function
// 🚀 Get all finance entries for a user
export async function getFinanceEntries(userId, date = null) {
  let query = supabase
    .from("finance")
    .select("*")
    .eq("user_id", userId)

  if (date) {
    query = query.eq("date", date)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load finance entries:", error)
    throw new Error("Could not load finance data.")
  }

  return data
}

// 🚀 Create a finance entry
export async function createFinanceEntry(entryData) {
  const { data, error } = await supabase
    .from("finance")
    .insert([entryData])
    .select()

  if (error) {
    console.error("Failed to add finance entry:", error)
    throw new Error("Could not add finance entry.")
  }

  return data[0]
}

// 🚀 Update a finance entry
export async function updateFinanceEntry(entryId, updates) {
  const { data, error } = await supabase
    .from("finance")
    .update(updates) // ⬅️ no `updated_at`
    .eq("id", entryId)
    .select()

  if (error) {
    console.error("Failed to update finance entry:", error.message, error.details, error.hint)
    throw new Error(error.message || "Could not update finance entry.")
  }

  return data?.[0]
}



// 🚀 Delete a finance entry
export async function deleteFinanceEntry(entryId) {
  const { error } = await supabase
    .from("finance")
    .delete()
    .eq("id", entryId)

  if (error) {
    console.error("Failed to delete finance entry:", error)
    throw new Error("Could not delete finance entry.")
  }

  return true
}


// Health functions

const isDemoUser = (userId) => {
  return userId === 'demo' || userId?.startsWith('demo-')
}

export async function getHealthEntries(userId, date) {
  if (isDemoUser(userId)) {
    return []
  }

  let query = supabase
    .from("health")
    .select("*")
    .eq("user_id", userId)

  if (date) {
    query = query.eq("date", date)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Create a new health entry
export async function createHealthEntry(entryData) {
  if (isDemoUser(entryData.user_id)) {
    return { id: `health-${Date.now()}`, ...entryData }
  }

  const { data, error } = await supabase
    .from("health")
    .insert([entryData])
    .select()
    
  if (error) throw error
  return data[0]
}

export async function updateHealthEntry(id, updates) {
  if (typeof id === 'string' && id.startsWith('health-')) {
    return { data: [{ id, ...updates }], error: null }
  }

  const { data, error } = await supabase
    .from("health")
    .update(updates)
    .eq("id", id)
    .select()

  return { data, error }
}

// Delete a health entry
export async function deleteHealthEntry(id) {
  const { data, error } = await supabase
    .from("health")
    .delete()
    .eq("id", id)
    .select()

  return { data, error }
}

// Get a specific health entry by ID
export async function getHealthEntryById(id) {
  const { data, error } = await supabase
    .from("health")
    .select("*")
    .eq("id", id)
    .single()

  return { data, error }
}

// Get health entries by type for a user
export async function getHealthEntriesByType(userId, type, startDate, endDate) {
  if (isDemoUser(userId)) {
    return []
  }

  let query = supabase
    .from("health")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)

  if (startDate) {
    query = query.gte("date", startDate)
  }

  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (error) throw error
  return data || []
}

// Get aggregated health data (for charts/analytics)
export async function getHealthSummary(userId, startDate, endDate) {
  if (isDemoUser(userId)) {
    return {}
  }

  let query = supabase
    .from("health")
    .select("type, value, date")
    .eq("user_id", userId)

  if (startDate) {
    query = query.gte("date", startDate)
  }

  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query.order("date", { ascending: true })

  if (error) throw error

  // Group data by type and date for summary
  const summary = {}
  data?.forEach(entry => {
    if (!summary[entry.type]) {
      summary[entry.type] = []
    }
    summary[entry.type].push({
      date: entry.date,
      value: entry.value
    })
  })

  return summary
}

//strength functions  
export async function getExercises(userId) {
  const { data, error } = await supabase
    .from("strength")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching exercises:", error)
    throw error
  }
  return data || []
}

// Create a new exercise
export async function createExercise(exerciseData) {
  const { data, error } = await supabase.from("strength").insert([exerciseData]).select().single()

  if (error) {
    console.error("Error creating exercise:", error)
    throw error
  }
  return data
}

// Update an exercise
export async function updateExercise(userId, exerciseId, updates) {
  const { data, error } = await supabase
    .from("strength")
    .update(updates)
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating exercise:", error)
    throw error
  }
  return data
}

// Delete an exercise
export async function deleteExercise(userId, exerciseId) {
  const { error } = await supabase.from("strength").delete().eq("id", exerciseId).eq("user_id", userId)

  if (error) {
    console.error("Error deleting exercise:", error)
    throw error
  }
  return true
}

// Update specific field (sets, reps, etc.) with increment/decrement
export async function updateExerciseField(userId, exerciseId, field, increment) {
  // Fetch current value first
  const { data: exercise, error: fetchError } = await supabase
    .from("strength")
    .select(field)
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .single()

  if (fetchError) {
    console.error("Error fetching exercise for update:", fetchError)
    throw fetchError
  }

  if (!exercise) throw new Error("Exercise not found")

  let newValue = exercise[field] || 0
  if (increment) {
    newValue += 1
  } else {
    newValue = Math.max(newValue - 1, 0) // don't go below 0
  }

  const { data, error } = await supabase
    .from("strength")
    .update({ [field]: newValue })
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating exercise field:", error)
    throw error
  }
  return data
}

// Toggle completed status
export async function toggleExerciseCompleted(userId, exerciseId, currentCompleted) {
  const { data, error } = await supabase
    .from("strength")
    .update({
      completed: !currentCompleted,
      completed_at: !currentCompleted ? new Date().toISOString() : null,
    })
    .eq("id", exerciseId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error toggling exercise completion:", error)
    throw error
  }
  return data
}



// ===== TASKS FUNCTIONS =====

// Fetch tasks for a specific user
export async function getTasks(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })

  if (error) throw error
  return data
}

// Create a new task
export async function createTask(taskData) {
  if (isDemoUser(taskData.user_id)) {
    return { id: `task-${Date.now()}`, ...taskData }
  }

  const { data, error } = await supabase.from("tasks").insert([taskData]).select()
  if (error) throw error
  return data[0]
}

// Update a task
export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date() })
    .eq("id", taskId)
    .select()

  if (error) throw error
  return data[0]
}

// Delete a task
export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)
  if (error) throw error
  return true
}

// Toggle task completion
export async function toggleTaskCompleted(taskId, currentCompleted) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: !currentCompleted ? "completed" : "todo",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()

  if (error) throw error
  return data[0]
}

// Projects functions
export async function getProjects(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createProject(projectData) {
  if (isDemoUser(projectData.user_id)) {
    return { id: `project-${Date.now()}`, ...projectData }
  }

  const { data, error } = await supabase.from("projects").insert([projectData]).select()
  if (error) throw error
  return data[0]
}

export async function updateProject(projectId, updates) {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date() })
    .eq("id", projectId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteProject(projectId) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId)
  if (error) throw error
  return true
}

// ===== MOOD TRACKING FUNCTIONS (Updated for your schema) =====

// Fetch mood entries for a specific user
export async function getMoodEntries(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("mood")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching mood entries:", error)
      throw error
    }

    // Transform the data to match the expected format
    return (data || []).map((entry) => ({
      id: entry.id,
      user_id: entry.user_id,
      mood: entry.mood_value, // Map mood_value to mood
      note: entry.notes, // Map notes to note
      date: entry.date,
      time: new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      created_at: entry.created_at,
      energy_level: entry.energy_level, // Keep energy_level for potential future use
    }))
  } catch (error) {
    console.error("Error in getMoodEntries:", error)
    throw error
  }
}

// Create a new mood entry
export async function createMoodEntry(moodData) {
  if (isDemoUser(moodData.user_id)) {
    return { id: `mood-${Date.now()}`, ...moodData }
  }

  try {
    // Transform the data to match your table schema
    const insertData = {
      user_id: moodData.user_id,
      mood_value: moodData.mood, // Map mood to mood_value
      energy_level: moodData.energy_level || 3, // Default energy level if not provided
      notes: moodData.note || null, // Map note to notes
      date: moodData.date,
    }

    const { data, error } = await supabase.from("mood").insert([insertData]).select()

    if (error) {
      console.error("Error creating mood entry:", error)
      throw error
    }

    // Transform back to expected format
    const created = data[0]
    return {
      id: created.id,
      user_id: created.user_id,
      mood: created.mood_value,
      note: created.notes,
      date: created.date,
      time: new Date(created.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      created_at: created.created_at,
      energy_level: created.energy_level,
    }
  } catch (error) {
    console.error("Error in createMoodEntry:", error)
    throw error
  }
}

// Update a mood entry
export async function updateMoodEntry(entryId, updates) {
  try {
    // Transform updates to match your schema
    const transformedUpdates = {}
    if (updates.mood) transformedUpdates.mood_value = updates.mood
    if (updates.note) transformedUpdates.notes = updates.note
    if (updates.energy_level) transformedUpdates.energy_level = updates.energy_level

    const { data, error } = await supabase.from("mood").update(transformedUpdates).eq("id", entryId).select()

    if (error) {
      console.error("Error updating mood entry:", error)
      throw error
    }

    // Transform back to expected format
    const updated = data[0]
    return {
      id: updated.id,
      user_id: updated.user_id,
      mood: updated.mood_value,
      note: updated.notes,
      date: updated.date,
      time: new Date(updated.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      created_at: updated.created_at,
      energy_level: updated.energy_level,
    }
  } catch (error) {
    console.error("Error in updateMoodEntry:", error)
    throw error
  }
}

// Delete a mood entry
export async function deleteMoodEntry(entryId) {
  try {
    const { error } = await supabase.from("mood").delete().eq("id", entryId)
    if (error) {
      console.error("Error deleting mood entry:", error)
      throw error
    }
    return true
  } catch (error) {
    console.error("Error in deleteMoodEntry:", error)
    throw error
  }
}
// ===== ACHIEVEMENTS FUNCTIONS =====

// Fetch achievements for a specific user
export async function getAchievements(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("date_earned", { ascending: false })

    if (error) {
      console.error("Error fetching achievements:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getAchievements:", error)
    throw error
  }
}

// Create a new achievement
export async function createAchievement(achievementData) {
  if (isDemoUser(achievementData.user_id)) {
    return { id: `achievement-${Date.now()}`, ...achievementData }
  }

  try {
    const { data, error } = await supabase.from("achievements").insert([achievementData]).select()

    if (error) {
      console.error("Error creating achievement:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in createAchievement:", error)
    throw error
  }
}
// ====revdiew function
export async function getReviews(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getReviews:", error)
    throw error
  }
}

// Create a new review
export async function createReview(reviewData) {
  if (isDemoUser(reviewData.user_id)) {
    return { id: `review-${Date.now()}`, ...reviewData }
  }

  try {
    const { data, error } = await supabase.from("reviews").insert([reviewData]).select()

    if (error) {
      console.error("Error creating review:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in createReview:", error)
    throw error
  }
}

// Update a review
export async function updateReview(reviewId, updates) {
  try {
    const { data, error } = await supabase.from("reviews").update(updates).eq("id", reviewId).select()

    if (error) {
      console.error("Error updating review:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateReview:", error)
    throw error
  }
}

// Delete a review
export async function deleteReview(reviewId) {
  try {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
    if (error) {
      console.error("Error deleting review:", error)
      throw error
    }
    return true
  } catch (error) {
    console.error("Error in deleteReview:", error)
    throw error
  }
}
// ===== AI REVIEW FUNCTIONS =====

// Fetch AI reviews for a specific user
export async function getAIReviews(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("ai_reviews")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching AI reviews:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getAIReviews:", error)
    throw error
  }
}

// Create a new AI review
export async function createAIReview(reviewData) {
  if (isDemoUser(reviewData.user_id)) {
    return { id: `ai-review-${Date.now()}`, ...reviewData }
  }

  try {
    const { data, error } = await supabase.from("ai_reviews").insert([reviewData]).select()

    if (error) {
      console.error("Error creating AI review:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in createAIReview:", error)
    throw error
  }
}
//discipline 
export async function createDisciplineEntry(disciplineData) {
  if (isDemoUser(disciplineData.user_id)) {
    return { id: `discipline-${Date.now()}`, ...disciplineData }
  }

  try {
    const { data, error } = await supabase.from("discipline").insert([disciplineData]).select()

    if (error) {
      console.error("Error creating discipline entry:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in createDisciplineEntry:", error)
    throw error
  }
}

// Update a discipline entry
export async function updateDisciplineEntry(entryId, updates) {
  try {
    const { data, error } = await supabase.from("discipline").update(updates).eq("id", entryId).select()

    if (error) {
      console.error("Error updating discipline entry:", error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateDisciplineEntry:", error)
    throw error
  }
}

// Delete a discipline entry
export async function deleteDisciplineEntry(entryId) {
  try {
    const { error } = await supabase.from("discipline").delete().eq("id", entryId)
    if (error) {
      console.error("Error deleting discipline entry:", error)
      throw error
    }
    return true
  } catch (error) {
    console.error("Error in deleteDisciplineEntry:", error)
    throw error
  }
}

// Get weekly data for AI analysis
export async function getWeeklyData(userId) {
  if (isDemoUser(userId)) {
    // Return mock data for demo
    return {
      overallScore: 85,
      weeklyTrend: 12,
      goalsCompleted: 8,
      totalGoals: 10,
      activeDays: 6,
      completionRate: 80,
      highlights: [
        { title: "Consistent Exercise", description: "Worked out 5 days this week" },
        { title: "Project Progress", description: "Completed 3 major milestones" },
        { title: "Learning Goals", description: "Finished 2 online courses" },
      ],
    }
  }

  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Fetch data from various tables for the past week
    const [exercises, tasks, projects, timeTracking, mood] = await Promise.all([
      getExercises(userId),
      getTasks(userId),
      getProjects(userId),
      getTimeSessions(userId),
      getMoodEntries(userId),
    ])

    // Filter data for the past week
    const weeklyExercises = exercises.filter((e) => new Date(e.date) >= weekAgo)
    const weeklyTasks = tasks.filter((t) => new Date(t.created_at) >= weekAgo)
    const weeklyTimeTracking = timeTracking.filter((t) => new Date(t.date) >= weekAgo)
    const weeklyMood = mood.filter((m) => new Date(m.date) >= weekAgo)

    // Calculate metrics
    const completedExercises = weeklyExercises.filter((e) => e.completed).length
    const completedTasks = weeklyTasks.filter((t) => t.status === "completed").length
    const totalTasks = weeklyTasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate active days (days with any activity)
    const activeDates = new Set([
      ...weeklyExercises.map((e) => e.date),
      ...weeklyTasks.map((t) => t.created_at.split("T")[0]),
      ...weeklyTimeTracking.map((t) => t.date),
    ])

    return {
      overallScore: Math.min(100, Math.round((completionRate + activeDates.size * 10) / 2)),
      weeklyTrend: Math.floor(Math.random() * 20) - 10, // Mock trend for now
      goalsCompleted: completedExercises + completedTasks,
      totalGoals: weeklyExercises.length + totalTasks,
      activeDays: activeDates.size,
      completionRate,
      highlights: [
        { title: "Exercise Progress", description: `Completed ${completedExercises} exercises` },
        { title: "Task Management", description: `Finished ${completedTasks} tasks` },
        { title: "Time Tracking", description: `Logged ${weeklyTimeTracking.length} sessions` },
      ],
    }
  } catch (error) {
    console.error("Error getting weekly data:", error)
    throw error
  }
}

// Get monthly data for AI analysis
export async function getMonthlyData(userId) {
  if (isDemoUser(userId)) {
    // Return mock data for demo
    return {
      overallScore: 78,
      monthlyTrend: 8,
      totalGoals: 45,
      completedGoals: 35,
      activeDays: 22,
      currentStreak: 7,
      categories: [
        { name: "Fitness", score: 85 },
        { name: "Learning", score: 72 },
        { name: "Projects", score: 80 },
        { name: "Health", score: 75 },
      ],
      achievements: [
        { title: "Fitness Milestone", description: "Completed 20 workouts", category: "Health" },
        { title: "Learning Streak", description: "7 days of continuous learning", category: "Education" },
        { title: "Project Success", description: "Finished major project", category: "Work" },
      ],
    }
  }

  try {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)

    // Fetch data from various tables for the past month
    const [exercises, tasks, projects, achievements] = await Promise.all([
      getExercises(userId),
      getTasks(userId),
      getProjects(userId),
      getAchievements(userId),
    ])

    // Filter data for the past month
    const monthlyExercises = exercises.filter((e) => new Date(e.date) >= monthAgo)
    const monthlyTasks = tasks.filter((t) => new Date(t.created_at) >= monthAgo)
    const monthlyAchievements = achievements.filter((a) => new Date(a.date_earned) >= monthAgo)

    // Calculate metrics
    const completedExercises = monthlyExercises.filter((e) => e.completed).length
    const completedTasks = monthlyTasks.filter((t) => t.status === "completed").length
    const totalGoals = monthlyExercises.length + monthlyTasks.length
    const completedGoals = completedExercises + completedTasks

    const overallScore = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

    return {
      overallScore,
      monthlyTrend: Math.floor(Math.random() * 20) - 10, // Mock trend for now
      totalGoals,
      completedGoals,
      activeDays: 22, // Mock for now
      currentStreak: 7, // Mock for now
      categories: [
        { name: "Fitness", score: Math.round((completedExercises / Math.max(monthlyExercises.length, 1)) * 100) },
        { name: "Tasks", score: Math.round((completedTasks / Math.max(monthlyTasks.length, 1)) * 100) },
        { name: "Projects", score: 75 }, // Mock
        { name: "Overall", score: overallScore },
      ],
      achievements: monthlyAchievements.map((a) => ({
        title: a.name,
        description: a.description,
        category: a.badge_type,
      })),
    }
  } catch (error) {
    console.error("Error getting monthly data:", error)
    throw error
  }
}

// Generate AI insights (mock implementation)
export async function generateAIInsights(weeklyData, monthlyData) {
  // This would typically call an AI service, but for now we'll return mock insights
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

  const overallScore = (weeklyData.overallScore + monthlyData.overallScore) / 2

  let grade = "C"
  let gradeDescription = "Good effort, room for improvement"

  if (overallScore >= 90) {
    grade = "A+"
    gradeDescription = "Outstanding performance!"
  } else if (overallScore >= 80) {
    grade = "A"
    gradeDescription = "Excellent work!"
  } else if (overallScore >= 70) {
    grade = "B"
    gradeDescription = "Good progress!"
  } else if (overallScore >= 60) {
    grade = "C"
    gradeDescription = "Satisfactory, keep improving"
  }

  return {
    overall: `Based on your recent activity, you're showing ${
      overallScore >= 75 ? "strong" : "steady"
    } progress across multiple areas. Your consistency in ${
      weeklyData.activeDays >= 5 ? "daily activities" : "goal completion"
    } is particularly noteworthy.`,
    strengths: [
      "Consistent daily activity tracking",
      "Good completion rate for set goals",
      "Regular engagement with fitness activities",
      "Effective time management",
    ],
    improvements: [
      "Consider setting more challenging goals",
      "Focus on maintaining longer streaks",
      "Explore new activity categories",
      "Improve work-life balance",
    ],
    grade,
    gradeDescription,
    recommendations: [
      {
        title: "Increase Daily Exercise",
        description: "Add 15 minutes of cardio to your routine",
        priority: "High",
        estimatedTime: "15 min",
        category: "Health",
      },
      {
        title: "Weekly Planning Session",
        description: "Schedule a weekly review and planning session",
        priority: "Medium",
        estimatedTime: "30 min",
        category: "Productivity",
      },
      {
        title: "Learn New Skill",
        description: "Start a new online course or tutorial",
        priority: "Low",
        estimatedTime: "1 hour",
        category: "Learning",
      },
    ],
  }
}

// ===== TIME TRACKING FUNCTIONS (Updated for your schema) =====

// Fetch time tracking entries for a specific user
export async function getTimeSessions(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("time_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching time tracking entries:", error)
      throw error
    }

    // Transform the data to match the expected format
    return (data || []).map((entry) => ({
      id: entry.id,
      user_id: entry.user_id,
      task: entry.activity, // Map activity to task
      duration: entry.duration || 0,
      category: entry.category,
      date: entry.date,
      completed: entry.end_time !== null, // Consider completed if has end_time
      created_at: entry.created_at,
    }))
  } catch (error) {
    console.error("Error in getTimeSessions:", error)
    throw error
  }
}

// Create a new time tracking entry
export async function createTimeSession(sessionData) {
  if (isDemoUser(sessionData.user_id)) {
    return { id: `session-${Date.now()}`, ...sessionData }
  }

  try {
    // Transform the data to match your table schema
    const insertData = {
      user_id: sessionData.user_id,
      category: sessionData.category,
      activity: sessionData.task, // Map task to activity
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(), // Set end_time since it's completed
      duration: sessionData.duration,
      date: sessionData.date,
      notes: sessionData.notes || null,
    }

    const { data, error } = await supabase.from("time_tracking").insert([insertData]).select()

    if (error) {
      console.error("Error creating time tracking entry:", error)
      throw error
    }

    // Transform back to expected format
    const created = data[0]
    return {
      id: created.id,
      user_id: created.user_id,
      task: created.activity,
      duration: created.duration,
      category: created.category,
      date: created.date,
      completed: true,
      created_at: created.created_at,
    }
  } catch (error) {
    console.error("Error in createTimeSession:", error)
    throw error
  }
}

// Update a time tracking entry
export async function updateTimeSession(sessionId, updates) {
  try {
    // Transform updates to match your schema
    const transformedUpdates = {}
    if (updates.task) transformedUpdates.activity = updates.task
    if (updates.duration) transformedUpdates.duration = updates.duration
    if (updates.category) transformedUpdates.category = updates.category
    if (updates.notes) transformedUpdates.notes = updates.notes

    const { data, error } = await supabase.from("time_tracking").update(transformedUpdates).eq("id", sessionId).select()

    if (error) {
      console.error("Error updating time tracking entry:", error)
      throw error
    }

    // Transform back to expected format
    const updated = data[0]
    return {
      id: updated.id,
      user_id: updated.user_id,
      task: updated.activity,
      duration: updated.duration,
      category: updated.category,
      date: updated.date,
      completed: updated.end_time !== null,
      created_at: updated.created_at,
    }
  } catch (error) {
    console.error("Error in updateTimeSession:", error)
    throw error
  }
}

// Delete a time tracking entry
export async function deleteTimeSession(sessionId) {
  try {
    const { error } = await supabase.from("time_tracking").delete().eq("id", sessionId)
    if (error) {
      console.error("Error deleting time tracking entry:", error)
      throw error
    }
    return true
  } catch (error) {
    console.error("Error in deleteTimeSession:", error)
    throw error
  }
}

// Daily summary functions
export async function getDailySummary(userId, date) {
  

  const { data, error } = await supabase
    .from("daily_summary")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function getDailySummaries(userId, startDate, endDate) {
  

  const query = supabase.from("daily_summary").select("*").eq("user_id", userId)
  if (startDate && endDate) {
    query.gte("date", startDate).lte("date", endDate)
  }

  const { data, error } = await query.order("date", { ascending: false })
  if (error) throw error
  return data
}

export async function createOrUpdateDailySummary(summaryData) {
  if (isDemoUser(summaryData.user_id)) {
    return { id: `summary-${Date.now()}`, ...summaryData }
  }

  const { data: existing } = await supabase
    .from("daily_summary")
    .select("id")
    .eq("user_id", summaryData.user_id)
    .eq("date", summaryData.date)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from("daily_summary")
      .update({ ...summaryData, updated_at: new Date() })
      .eq("id", existing.id)
      .select()

    if (error) throw error
    return data[0]
  } else {
    const { data, error } = await supabase.from("daily_summary").insert([summaryData]).select()
    if (error) throw error
    return data[0]
  }
}
export async function getDisciplineEntries(userId) {
  if (isDemoUser(userId)) {
    return [] // Return empty for demo
  }

  try {
    const { data, error } = await supabase
      .from("discipline")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching discipline entries:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getDisciplineEntries:", error)
    throw error
  }
}

// Get activities for a specific date across all tables
export async function getDailyActivities(userId, date) {
  if (isDemoUser(userId)) {
    return {
      skills: mockData.skills.slice(0, 2),
      intelligence: mockData.intelligence.slice(0, 1),
      finance: mockData.finance.slice(0, 1),
      discipline: [],
      health: [],
      strength: [],
      tasks: [],
      mood: [],
    }
  }

  const [skills, intelligence, finance, discipline, health, strength, tasks, mood] = await Promise.all([
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .gte("updated_at", `${date}T00:00:00`)
      .lt("updated_at", `${date}T23:59:59`),
    supabase
      .from("intelligence")
      .select("*")
      .eq("user_id", userId)
      .gte("updated_at", `${date}T00:00:00`)
      .lt("updated_at", `${date}T23:59:59`),
    supabase.from("finance").select("*").eq("user_id", userId).eq("date", date),
    supabase.from("discipline").select("*").eq("user_id", userId).eq("date", date),
    supabase.from("health").select("*").eq("user_id", userId).eq("date", date),
    supabase.from("strength").select("*").eq("user_id", userId).eq("date", date),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .gte("updated_at", `${date}T00:00:00`)
      .lt("updated_at", `${date}T23:59:59`),
    supabase.from("mood").select("*").eq("user_id", userId).eq("date", date),
  ])

  return {
    skills: skills.data || [],
    intelligence: intelligence.data || [],
    finance: finance.data || [],
    discipline: discipline.data || [],
    health: health.data || [],
    strength: strength.data || [],
    tasks: tasks.data || [],
    mood: mood.data || [],
  }
}
