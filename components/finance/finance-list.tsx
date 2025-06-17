"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Trash, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { getFinanceEntries, deleteFinanceEntry } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"

interface FinanceListProps {
  type?: string
  searchQuery?: string
}

export default function FinanceList({ type, searchQuery = "" }: FinanceListProps) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    async function loadEntries() {
      if (!user) return

      try {
        const data = await getFinanceEntries(user.id)
        let filteredData = data

        if (type) {
          filteredData = data.filter((entry) => entry.type === type)
        }

        if (searchQuery) {
          filteredData = filteredData.filter(
            (entry) =>
              entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              entry.category?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        }

        setEntries(filteredData)
      } catch (error) {
        console.error("Error loading finance entries:", error)
        toast({
          title: "Error",
          description: "Failed to load finance entries. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadEntries()

    // Subscribe to changes
    const subscription = supabase
      .channel("finance_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance",
        },
        () => {
          loadEntries()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, type, searchQuery, toast])

  const handleDelete = async (entryId: string) => {
    try {
      await deleteFinanceEntry(entryId)
      toast({
        title: "Success",
        description: "Finance entry deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "expense":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "investment":
        return <PiggyBank className="h-4 w-4 text-blue-500" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-500"
      case "expense":
        return "bg-red-500"
      case "investment":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
          <div className="col-span-2">Transaction</div>
          <div className="hidden md:block">Category</div>
          <div className="hidden md:block">Amount</div>
          <div className="hidden md:block">Date</div>
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
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchQuery ? "No transactions found matching your search." : "No finance entries added yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
        <div className="col-span-2">Transaction</div>
        <div className="hidden md:block">Category</div>
        <div className="hidden md:block">Amount</div>
        <div className="hidden md:block">Date</div>
        <div className="text-right">Actions</div>
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-0">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              {getIcon(entry.type)}
              <div>
                <div className="font-medium">{entry.description || "Transaction"}</div>
                <div className="text-xs text-muted-foreground capitalize">{entry.type}</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">{entry.category}</div>
          <div className="hidden md:block">
            <span
              className={`font-medium ${
                entry.type === "income" ? "text-green-600" : entry.type === "expense" ? "text-red-600" : "text-blue-600"
              }`}
            >
              ${Number.parseFloat(entry.amount).toLocaleString()}
            </span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {new Date(entry.date).toLocaleDateString()}
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
                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(entry.id)}>
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
