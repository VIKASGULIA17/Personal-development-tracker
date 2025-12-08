import { createClient } from "@supabase/supabase-js"

// Fallback values for demo mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cbfkleegtyupgviiybuc.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZmtsZWVndHl1cGd2aWl5YnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4MzYsImV4cCI6MjA4MDc4ODgzNn0.SmX0QXrV5ubFL2kkmkk1UCsOr5xvQUIkfZZxwFkXhJA"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})



// Create a server-side client (for use in Server Components and Server Actions)
export const createServerSupabaseClient = () => {
  const serverUrl = process.env.SUPABASE_URL || supabaseUrl
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(serverUrl, serverKey)
}
