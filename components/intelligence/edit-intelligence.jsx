"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateIntelligenceItem } from "@/lib/db"

const types = ["book", "video", "podcast", "course"]
const statuses = ["todo", "in_progress", "completed"]

export default function EditIntelligenceDialog({ entry, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    author: "",
    description: "",
    status: "todo",
    progress: 0,
  })

  const { toast } = useToast()

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type || "",
        title: entry.title || "",
        author: entry.author || "",
        description: entry.description || "",
        status: entry.status || "todo",
        progress: entry.progress || 0,
      })
    }
  }, [entry])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.type || !formData.status) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updateIntelligenceItem(entry.id, {
        ...formData,
        progress: Number(formData.progress),
      })

      toast({
        title: "Success",
        description: "Entry updated successfully.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating intelligence entry:", error)
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Intelligence Entry</DialogTitle>
          <DialogDescription>Update your learning material details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2 h-[78vh]  md:h-auto overflow-scroll md:overflow-auto">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Atomic Habits"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Learn habit-forming strategies..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min={0}
              max={100}
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
