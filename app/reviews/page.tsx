"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Plus, Calendar, Star, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getReviews, createReview } from "@/lib/db"

export default function ReviewsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newReview, setNewReview] = useState({
    type: "daily",
    content: "",
    mood: 3,
  })

  useEffect(() => {
    if (user?.id) {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      const data = await getReviews(user.id)
      setReviews(data)
    } catch (err) {
      setError("Failed to fetch reviews")
      console.error("Error fetching reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  const addReview = async () => {
    if (!newReview.content.trim()) {
      toast({
        title: "Review Required",
        description: "Please write your review before submitting",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) return

    try {
      const reviewData = {
        user_id: user.id,
        type: newReview.type,
        content: newReview.content,
        mood: newReview.mood,
        date: new Date().toISOString().split("T")[0],
      }

      const createdReview = await createReview(reviewData)
      if (createdReview) {
        setReviews([createdReview, ...reviews])
        setNewReview({
          type: "daily",
          content: "",
          mood: 3,
        })

        toast({
          title: "Review Added!",
          description: "Your reflection has been saved successfully",
        })
      }
    } catch (err) {
      setError("Failed to create review")
      console.error("Error creating review:", err)
    }
  }

  const updateRating = (rating) => {
    setNewReview({ ...newReview, mood: rating })
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "daily":
        return "bg-blue-500"
      case "weekly":
        return "bg-green-500"
      case "monthly":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "daily":
        return <Calendar className="h-4 w-4" />
      case "weekly":
        return <TrendingUp className="h-4 w-4" />
      case "monthly":
        return <BookOpen className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.mood || 3), 0) / reviews.length).toFixed(1) : 0

  const thisWeekReviews = reviews.filter((r) => {
    const reviewDate = new Date(r.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return reviewDate >= weekAgo
  }).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Please log in to view your reviews</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reviews & Reflections</h1>
          <p className="text-sm md:text-base text-muted-foreground">Reflect on your progress and plan improvements</p>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-600">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-blue-100 dark:bg-blue-900">
              <MessageSquare className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Total Reviews</p>
              <p className="text-lg md:text-2xl font-bold">{reviews.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-yellow-100 dark:bg-yellow-900">
              <Star className="h-4 w-4 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Avg Rating</p>
              <p className="text-lg md:text-2xl font-bold">{averageRating}/5</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">This Week</p>
              <p className="text-lg md:text-2xl font-bold">{thisWeekReviews}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-4 md:p-6">
            <div className="rounded-full p-2 md:p-3 bg-purple-100 dark:bg-purple-900">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm font-medium leading-none">Streak</p>
              <p className="text-lg md:text-2xl font-bold">7 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Tabs */}
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="write" className="text-xs md:text-sm">
            Write Review
          </TabsTrigger>
          <TabsTrigger value="daily" className="text-xs md:text-sm">
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs md:text-sm">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs md:text-sm">
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Write New Review</CardTitle>
              <CardDescription className="text-sm">Reflect on your progress and experiences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Type</label>
                <div className="flex flex-wrap gap-2">
                  {["daily", "weekly", "monthly"].map((type) => (
                    <Button
                      key={type}
                      variant={newReview.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewReview({ ...newReview, type })}
                      className="capitalize"
                    >
                      {getTypeIcon(type)}
                      <span className="ml-2">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Overall Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button key={rating} variant="ghost" size="sm" onClick={() => updateRating(rating)} className="p-1">
                      <Star
                        className={`h-6 w-6 ${
                          rating <= newReview.mood ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reflection</label>
                <Textarea
                  placeholder="How did today/this week/this month go? What did you learn? What would you do differently?"
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button onClick={addReview} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Save Review
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {["daily", "weekly", "monthly"].map((tabType) => (
          <TabsContent key={tabType} value={tabType} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl capitalize">{tabType} Reviews</CardTitle>
                <CardDescription className="text-sm">Your {tabType} reflections and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {reviews
                    .filter((r) => r.type === tabType)
                    .map((review) => (
                      <div key={review.id} className="p-3 md:p-4 border rounded-lg space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(review.type)}
                            <span className="text-sm font-medium">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (review.mood || 3) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className={`${getTypeColor(review.type)} text-white text-xs`}>
                            {review.type}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      </div>
                    ))}

                  {reviews.filter((r) => r.type === tabType).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No {tabType} reviews yet. Start reflecting on your {tabType} progress!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
