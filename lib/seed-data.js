import { supabase } from "./supabase"

export async function seedUserData(userId) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayFormatted = today.toISOString().split("T")[0]
  const yesterdayFormatted = yesterday.toISOString().split("T")[0]

  // Seed skills
  
  // Seed tasks
  const tasks = [
    {
      user_id: userId,
      title: "Complete React project",
      description: "Finish the personal dashboard project",
      status: "in_progress",
      priority: "high",
      due_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split("T")[0],
      estimated_time: 120,
    },
    {
      user_id: userId,
      title: "Read 30 pages",
      description: "Continue reading Atomic Habits",
      status: "todo",
      priority: "medium",
      due_date: todayFormatted,
      estimated_time: 45,
    },
    {
      user_id: userId,
      title: "Morning workout",
      description: "Complete full body workout routine",
      status: "completed",
      priority: "high",
      due_date: todayFormatted,
      estimated_time: 60,
      actual_time: 45,
    },
  ]

  // Seed daily summaries
  const dailySummaries = [
    {
      user_id: userId,
      date: todayFormatted,
      productivity_score: 8,
      mood_score: 7,
      completed_tasks: 5,
      total_tasks: 8,
      focus_time: 240,
      highlights: "Completed a major milestone in the project",
      notes: "Overall productive day with good energy levels",
    },
    {
      user_id: userId,
      date: yesterdayFormatted,
      productivity_score: 7,
      mood_score: 8,
      completed_tasks: 6,
      total_tasks: 7,
      focus_time: 210,
      highlights: "Finished reading a chapter of Atomic Habits",
      notes: "Good day with balanced activities",
    },
  ]

  try {
    // Insert data into tables
    await Promise.all([
      supabase.from("skills").insert(skills),
      supabase.from("intelligence").insert(intelligenceItems),
      supabase.from("health").insert(healthEntries),
      supabase.from("strength").insert(strengthEntries),
      supabase.from("tasks").insert(tasks),
      supabase.from("daily_summary").insert(dailySummaries),
    ])

    return true
  } catch (error) {
    console.error("Error seeding data:", error)
    return false
  }
}
