"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddIntelligenceButton from "@/components/intelligence/add-intelligence-button"
import IntelligenceList from "@/components/intelligence/intelligence-list"
import IntelligenceStats from "@/components/intelligence/intelligence-stats"

export default function IntelligencePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Intelligence</h1>
          <p className="text-muted-foreground">Track your learning journey and knowledge growth</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search learning materials..."
              className="w-full pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddIntelligenceButton />
        </div>
      </div>

      <IntelligenceStats />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <IntelligenceList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="books" className="space-y-6">
          <IntelligenceList type="book" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <IntelligenceList type="video" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="podcasts" className="space-y-6">
          <IntelligenceList type="podcast" searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <IntelligenceList type="course" searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
