"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getFinanceEntries } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function FinanceStats() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    netWorth: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      try {
        const entries = await getFinanceEntries(user.id)

        const income = entries
          .filter((entry) => entry.type === "income")
          .reduce((sum, entry) => sum + Number.parseFloat(entry.amount), 0)

        const expenses = entries
          .filter((entry) => entry.type === "expense")
          .reduce((sum, entry) => sum + Number.parseFloat(entry.amount), 0)

        const investments = entries
          .filter((entry) => entry.type === "investment")
          .reduce((sum, entry) => sum + Number.parseFloat(entry.amount), 0)

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          totalInvestments: investments,
          netWorth: income - expenses + investments,
        })
      } catch (error) {
        console.error("Error loading finance stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-green-100 dark:bg-green-900">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Total Income</p>
            <p className="text-2xl font-bold">${stats.totalIncome.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-red-100 dark:bg-red-900">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Total Expenses</p>
            <p className="text-2xl font-bold">${stats.totalExpenses.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900">
            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Investments</p>
            <p className="text-2xl font-bold">${stats.totalInvestments.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center gap-4 p-6">
          <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900">
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Net Worth</p>
            <p className="text-2xl font-bold">${stats.netWorth.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
