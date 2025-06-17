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
  const { data, error } = await supabase
    .from("skills")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", skillId)
    .select()
    .single()

  if (error) throw error
  return data
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
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", entryId)
    .select()

  if (error) {
    console.error("Failed to update finance entry:", error)
    throw new Error("Could not update finance entry.")
  }

  return data[0]
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
// Strength functions
export async function getStrengthEntries(userId, date) {
  if (isDemoUser(userId)) {
    return []
  }

  let query = supabase
    .from("strength")
    .select("*")
    .eq("user_id", userId)

  if (date) {
    query = query.eq("date", date)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function updateStrengthEntry(entryId, updates) {
  const { data, error } = await supabase
    .from("strength")
    .update(updates)
    .eq("id", entryId)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createStrengthEntry(entryData) {
  if (isDemoUser(entryData.user_id)) {
    return { id: `strength-${Date.now()}`, ...entryData }
  }

  const { data, error } = await supabase.from("strength").insert([entryData]).select()
  if (error) throw error
  return data[0]
}

// Tasks functions
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

export async function createTask(taskData) {
  if (isDemoUser(taskData.user_id)) {
    return { id: `task-${Date.now()}`, ...taskData }
  }

  const { data, error } = await supabase.from("tasks").insert([taskData]).select()
  if (error) throw error
  return data[0]
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date() })
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

// Daily summary functions
export async function getDailySummary(userId, date) {
  if (isDemoUser(userId)) {
    return {
      productivity_score: 8,
      mood_score: 7,
      completed_tasks: 5,
      total_tasks: 8,
      focus_time: 240,
      highlights: "Completed a major milestone in the project",
      notes: "Overall productive day with good energy levels",
    }
  }

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
  if (isDemoUser(userId)) {
    return [
      {
        date: "2024-01-15",
        productivity_score: 8,
        mood_score: 7,
        completed_tasks: 5,
        total_tasks: 8,
        focus_time: 240,
      },
    ]
  }

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
