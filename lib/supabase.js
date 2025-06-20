import { createClient } from "@supabase/supabase-js"

// Fallback values for demo mode
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xktpkuxmdzpsnfvifvax.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdHBrdXhtZHpwc25mdmlmdmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDI1NTgsImV4cCI6MjA2MzQ3ODU1OH0.im8e7_Ftoq7PN2TanRpBng1xOwiGQVMSxVEYvcK1mLo"

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
