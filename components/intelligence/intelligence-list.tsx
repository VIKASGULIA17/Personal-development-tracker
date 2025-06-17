"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Trash, BookOpen, Video, Headphones, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getIntelligenceItems, updateIntelligenceItem, deleteIntelligenceItem } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface IntelligenceListProps {
  type?: string
  searchQuery?: string
}

export default function IntelligenceList({ type, searchQuery = "" }: IntelligenceListProps) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    async function loadItems() {
      if (!user) return

      try {
        const data = await getIntelligenceItems(user.id)
        let filteredData = data

        if (type) {
          filteredData = data.filter((item) => item.type === type)
        }

        if (searchQuery) {
          filteredData = filteredData.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.author?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        }

        setItems(filteredData)
      } catch (error) {
        console.error("Error loading intelligence items:", error)
        toast({
          title: "Error",
          description: "Failed to load learning materials. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadItems()

    // Subscribe to changes
    const subscription = supabase
      .channel("intelligence_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "intelligence",
        },
        () => {
          loadItems()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, type, searchQuery, toast])

  const handleUpdateProgress = async (itemId: string, newProgress: number) => {
    try {
      const status = newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "todo"
      await updateIntelligenceItem(itemId, { progress: newProgress, status })
      toast({
        title: "Success",
        description: "Progress updated successfully",
      })
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      await deleteIntelligenceItem(itemId)
      toast({
        title: "Success",
        description: "Learning material deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "book":
        return <BookOpen className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      case "course":
        return <GraduationCap className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
          <div className="col-span-2">Material</div>
          <div className="hidden md:block">Author</div>
          <div className="hidden md:block">Progress</div>
          <div className="hidden md:block">Status</div>
          <div className="text-right">Actions</div>
        </div>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-0">
              <div className="col-span-2">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="text-right">
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchQuery ? "No materials found matching your search." : "No learning materials added yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
        <div className="col-span-2">Material</div>
        <div className="hidden md:block">Author</div>
        <div className="hidden md:block">Progress</div>
        <div className="hidden md:block">Status</div>
        <div className="text-right">Actions</div>
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-0">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              {getIcon(item.type)}
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">{item.author || "Unknown"}</div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <Progress
                value={item.progress}
                className="h-2 cursor-pointer"
                onClick={() => {
                  const newProgress = item.progress >= 100 ? 0 : Math.min(item.progress + 10, 100)
                  handleUpdateProgress(item.id, newProgress)
                }}
              />
              <span className="text-xs font-medium">{item.progress}%</span>
            </div>
          </div>
          <div className="hidden md:block">
            <Badge variant="outline" className={`${getStatusColor(item.status)} text-white`}>
              {item.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
