"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateSkill } from "@/lib/db"

const skillCategories = [
  "Programming",
  "Design",
  "Marketing",
  "Business",
  "Language",
  "Music",
  "Art",
  "Writing",
  "Health",
  "Fitness",
  "Cooking",
  "Other",
]

export default function EditSkillDialog({ skill, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    progress: 0,
    target_date: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || "",
        category: skill.category || "",
        description: skill.description || "",
        progress: skill.progress || 0,
        target_date: skill.target_date || "",
      })
    }
  }, [skill])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updateSkill(skill.id, {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        progress: Number.parseInt(formData.progress) || 0,
        target_date: formData.target_date || null,
      })

      toast({
        title: "Success",
        description: "Skill updated successfully!",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error",
        description: "Failed to update skill. Please try again.",
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
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogDescription>Update your skill information and progress.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-1 h-[78vh]  md:h-auto">
          <div className="space-y-1">
            <Label htmlFor="name">Skill Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., React Development"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you want to learn..."
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Skill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
