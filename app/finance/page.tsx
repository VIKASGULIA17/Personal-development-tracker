"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getFinanceEntries } from "@/lib/db";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddFinanceButton from "@/components/finance/add-finance-button";
import FinanceList from "@/components/finance/finance-list";
import FinanceStats from "@/components/finance/finance-stats";
import FinanceChart from "@/components/finance/finance-chart";

export default function FinancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalInvestments: 0,
    netWorth: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        const entries = await getFinanceEntries(user.id);

        const income = entries
          .filter((entry) => entry.type === "income")
          .reduce((sum, entry) => sum + Number(entry.amount), 0);

        const expenses = entries
          .filter((entry) => entry.type === "expense")
          .reduce((sum, entry) => sum + Number(entry.amount), 0);

        const investments = entries
          .filter((entry) => entry.type === "investment")
          .reduce((sum, entry) => sum + Number(entry.amount), 0);

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          totalInvestments: investments,
          netWorth: income - expenses + investments,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and financial goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddFinanceButton />
        </div>
      </div>

      <FinanceStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Income vs Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <FinanceChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>This month's summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Total Income</span>
              </div>
              <span className="font-bold text-green-500">
                ${stats.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Total Expenses</span>
              </div>
              <span className="font-bold text-red-500">
                ${stats.totalExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Net Income</span>
              <span className="font-bold text-blue-500">
                ${stats.netWorth.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="investment">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <FinanceList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <FinanceList type="income" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <FinanceList type="expense" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          <FinanceList type="investment" searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
