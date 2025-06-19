"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { updateFinanceEntry } from "@/lib/db"

const financeCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Investment",
  "Salary",
  "Business",
  "Other",
]

const financeTypes = ["income", "expense"]

export default function EditFinanceDialog({ entry, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    description: "",
    date: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (entry) {
      setFormData({
        type: entry.type || "",
        category: entry.category || "",
        amount: entry.amount || "",
        description: entry.description || "",
        date: entry.date || "",
      })
    }
  }, [entry])

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!formData.type || !formData.category || !formData.amount || !formData.date) {
    toast({
      title: "Error",
      description: "Please fill in all required fields.",
      variant: "destructive",
    })
    return
  }

  setLoading(true)
  try {
    const updates = {
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description || "",
      date: formData.date,
    }

    console.log("Submitting update:", updates) // ✅ Debug output

    await updateFinanceEntry(entry.id, updates)

    toast({
      title: "Success",
      description: "Finance entry updated successfully!",
    })

    onOpenChange(false)
  } catch (error) {
    console.error("Update failed:", error)
    toast({
      title: "Error",
      description: error.message || "Failed to update finance entry.",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader>
          <DialogTitle>Edit Finance Entry</DialogTitle>
          <DialogDescription>Update your finance entry information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {financeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {financeCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 100.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
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
