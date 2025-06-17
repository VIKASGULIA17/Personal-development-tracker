"use client"

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
import { createFinanceEntry } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notifications"

export default function AddFinanceButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      await createFinanceEntry({
        user_id: user.id,
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      })

      toast({
        title: "Success",
        description: "Finance entry added successfully",
      })

      addNotification({
        title: "New Finance Entry",
        message: `${formData.type} of $${formData.amount} has been recorded`,
        type: "success",
      })

      setFormData({
        type: "",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
      setOpen(false)
    } catch (error) {
      console.error("Error adding finance entry:", error)
      toast({
        title: "Error",
        description: "Failed to add finance entry. Please try again.",
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
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Finance Entry</DialogTitle>
            <DialogDescription>Record a new income, expense, or investment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => handleSelectChange("type", value)} value={formData.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Salary, Food, Stocks"
                required
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
