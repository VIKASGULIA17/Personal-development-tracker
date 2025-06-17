"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSkills, deleteSkill, updateSkill } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

export default function SkillsList() {
  const [activeTab, setActiveTab] = useState("all")
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadSkills() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const userId = session?.user?.id
        if (userId) {
          const skillsData = await getSkills(userId)
          setSkills(skillsData)
        }
      } catch (error) {
        console.error("Error loading skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSkills()

    const subscription = supabase
      .channel("skills_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "skills",
        },
        async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const userId = session?.user?.id
          if (userId) {
            const skillsData = await getSkills(userId)
            setSkills(skillsData)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  const handleDeleteSkill = async (skillId) => {
    try {
      await deleteSkill(skillId)
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProgress = async (skillId, newProgress) => {
    try {
      await updateSkill(skillId, { progress: newProgress })
      toast({
        title: "Success",
        description: "Progress updated successfully",
      })
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSkillStatus = (progress) => (progress === 100 ? "completed" : "in-progress")

  const filteredSkills =
    activeTab === "all" ? skills : skills.filter((skill) => getSkillStatus(skill.progress) === activeTab)

  if (loading) return <SkillsListSkeleton />

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      {["all", "in-progress", "completed"].map((tab) => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          {filteredSkills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {tab === "all"
                  ? "No skills added yet. Add your first skill to start tracking."
                  : `No ${tab.replace("-", " ")} skills found.`}
              </p>
            </div>
          ) : (
            <SkillTable
              skills={filteredSkills}
              onDelete={handleDeleteSkill}
              onUpdateProgress={handleUpdateProgress}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}

function SkillTable({ skills, onDelete, onUpdateProgress }) {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
        <div className="col-span-2">Skill</div>
        <div className="col-span-2 hidden md:block">Progress</div>
        <div className="hidden md:block">Last Updated</div>
        <div className="text-right">Actions</div>
      </div>
      {skills.map((skill) => (
        <div key={skill.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-0">
          <div className="col-span-2">
            <div className="font-medium">{skill.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <Badge variant="outline">{skill.category}</Badge>
            </div>
          </div>
          <div className="col-span-2 hidden md:block">
            <div className="flex items-center gap-2">
              <Progress
                value={skill.progress}
                className="h-2 cursor-pointer"
                onClick={() => {
                  const newProgress = skill.progress >= 100 ? 0 : skill.progress + 10
                  onUpdateProgress(skill.id, newProgress)
                }}
              />
              <span className="text-xs font-medium">{skill.progress}%</span>
            </div>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            {new Date(skill.updated_at).toLocaleDateString()}
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
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(skill.id)}>
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

function SkillsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="rounded-md border">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
          <div className="col-span-2">Skill</div>
          <div className="col-span-2 hidden md:block">Progress</div>
          <div className="hidden md:block">Last Updated</div>
          <div className="text-right">Actions</div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-0">
            <div className="col-span-2">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="col-span-2 hidden md:block">
              <Skeleton className="h-2 w-full mb-2" />
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-8 rounded-full ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
