"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cog,
  Dumbbell,
  FileText,
  Home,
  ListChecks,
  Menu,
  MessageSquare,
  PieChart,
  SmilePlus,
  Target,
  Wallet,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import UserMenu from "@/components/auth/user-menu"
import { NotificationCenter } from "@/lib/notifications"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Skills", href: "/skills", icon: Target },
  { name: "Intelligence", href: "/intelligence", icon: Brain },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Discipline", href: "/discipline", icon: Clock },
  { name: "Health", href: "/health", icon: SmilePlus },
  { name: "Strength", href: "/strength", icon: Dumbbell },
  { name: "Projects", href: "/projects", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: ListChecks },
  { name: "Achievements", href: "/achievements", icon: PieChart },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Review", href: "/ai-review", icon: Sparkles },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock },
  { name: "Reviews", href: "/reviews", icon: MessageSquare },
  { name: "Mood", href: "/mood", icon: SmilePlus },
  { name: "Settings", href: "/settings", icon: Cog },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 right-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Growth Tracker</h2>
              <NotificationCenter />
            </div>
            <nav className="flex-1 overflow-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-accent/50",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t p-4">
              <UserMenu />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-full border-r bg-background transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[240px]",
        )}
      >
        <div
          className={cn("flex items-center justify-between h-14 border-b px-4", isCollapsed && "justify-center px-0")}
        >
          {!isCollapsed && <h2 className="font-bold">Growth Tracker</h2>}
          {!isCollapsed && <NotificationCenter />}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  isCollapsed && "justify-center px-0",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        {!isCollapsed && (
          <div className="border-t p-4">
            <UserMenu />
          </div>
        )}
      </div>
    </>
  )
}
