"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getFinanceEntries } from "@/lib/db"
import { useAuth } from "@/lib/auth-context"

export default function FinanceChart() {
  const [chartData, setChartData] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    async function loadChartData() {
      if (!user) return

      try {
        const entries = await getFinanceEntries(user.id)

        // Group by month and calculate totals
        const monthlyData = entries.reduce((acc, entry) => {
          const month = new Date(entry.date).toLocaleDateString("en-US", { month: "short" })

          if (!acc[month]) {
            acc[month] = { month, income: 0, expenses: 0 }
          }

          if (entry.type === "income") {
            acc[month].income += Number.parseFloat(entry.amount)
          } else if (entry.type === "expense") {
            acc[month].expenses += Number.parseFloat(entry.amount)
          }

          return acc
        }, {})

        const chartArray = Object.values(monthlyData)
        setChartData(chartArray)
      } catch (error) {
        console.error("Error loading chart data:", error)
      }
    }

    loadChartData()
  }, [user])

  return (
    <ChartContainer
      config={{
        income: {
          label: "Income",
          color: "hsl(var(--chart-1))",
        },
        expenses: {
          label: "Expenses",
          color: "hsl(var(--chart-2))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} name="Expenses" />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
