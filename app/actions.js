"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { seedUserData } from "@/lib/seed-data"

export async function createUserProfile(formData) {
  const supabase = createServerSupabaseClient()

  try {
    const email = formData.get("email")
    const password = formData.get("password")
    const fullName = formData.get("fullName")

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) throw authError

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
    })

    if (profileError) throw profileError

    // Seed initial data
    await seedUserData(authData.user.id)

    return { success: true, userId: authData.user.id }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: error.message }
  }
}

export async function signInUser(formData) {
  const supabase = createServerSupabaseClient()

  try {
    const email = formData.get("email")
    const password = formData.get("password")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { success: true, userId: data.user.id }
  } catch (error) {
    console.error("Error signing in:", error)
    return { success: false, error: error.message }
  }
}

export async function signOutUser() {
  const supabase = createServerSupabaseClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { success: false, error: error.message }
  }
}
