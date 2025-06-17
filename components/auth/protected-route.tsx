"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/auth")

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage) {
        router.push("/auth/login")
      } else if (user && isAuthPage) {
        router.push("/")
      }
    }
  }, [user, loading, router, isAuthPage])

  if (loading) {
    if (isAuthPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )
    }

    return (
      <div className="flex h-screen">
        <div className="w-[240px] border-r bg-background p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  // If it's an auth page, render without sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  // If user is not authenticated and not on auth page, don't render anything
  if (!user) {
    return null
  }

  // Render with sidebar for authenticated users
  return <>{children}</>
}
