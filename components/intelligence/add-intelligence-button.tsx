"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createIntelligenceItem } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications"

export default function AddIntelligenceButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    author: "",
    description: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      await createIntelligenceItem({
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        status: "todo",
        progress: 0,
      })

      toast({
        title: "Success",
        description: "Learning material added successfully",
      })

      addNotification({
        title: "New Learning Material Added",
        message: `${formData.title} has been added to your intelligence tracker`,
        type: "success",
      })

      setFormData({
        type: "",
        title: "",
        author: "",
        description: "",
      })
      setOpen(false)
    } catch (error) {
      console.error("Error adding intelligence item:", error)
      toast({
        title: "Error",
        description: "Failed to add learning material. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Learning Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Learning Material</DialogTitle>
            <DialogDescription>Add a new book, video, podcast, or course to track.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={handleSelectChange} value={formData.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Atomic Habits"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Author/Creator</Label>
              <Input id="author" placeholder="e.g. James Clear" value={formData.author} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will you learn from this?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
