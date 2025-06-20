import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/lib/notifications"
import ProtectedRoute from "@/components/auth/protected-route"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Personal Growth Tracker</title>
        <meta name="description" content="Track your personal development journey" />
      </head>
      <body className="h-screen overflow-hidden font-sans antialiased bg-background">
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
      <NotificationProvider>
        <AuthWrapper>{children}</AuthWrapper>
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
</body>
    </html>
  )
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}


