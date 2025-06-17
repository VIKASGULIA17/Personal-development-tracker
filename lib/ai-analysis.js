import { getAllSkills, getAllIntelligenceItems, getAllFinanceEntries } from "./db"

// Mock AI analysis functions for demo purposes
// In production, these would call actual AI services like OpenAI

export async function getWeeklyData(userId) {
  try {
    // Get user data from the last 7 days
    const [skills, intelligence, finance] = await Promise.all([
      getAllSkills(userId),
      getAllIntelligenceItems(userId),
      getAllFinanceEntries(userId),
    ])

    // Calculate weekly metrics
    const totalItems = skills.length + intelligence.length + finance.length
    const completedItems = skills.filter((s) => s.completed).length + intelligence.filter((i) => i.completed).length

    const overallScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    const weeklyTrend = Math.floor(Math.random() * 20) - 10 // Mock trend

    return {
      overallScore,
      weeklyTrend,
      goalsCompleted: completedItems,
      totalGoals: totalItems,
      activeDays: Math.min(7, Math.max(1, Math.floor(Math.random() * 7) + 1)),
      completionRate: overallScore,
      highlights: [
        {
          title: "Skill Development",
          description: `Completed ${skills.filter((s) => s.completed).length} skills this week`,
        },
        {
          title: "Learning Progress",
          description: `Added ${intelligence.length} new learning items`,
        },
        {
          title: "Financial Tracking",
          description: `Logged ${finance.length} financial entries`,
        },
      ],
    }
  } catch (error) {
    console.error("Error getting weekly data:", error)
    return {
      overallScore: 75,
      weeklyTrend: 5,
      goalsCompleted: 8,
      totalGoals: 12,
      activeDays: 5,
      completionRate: 75,
      highlights: [
        {
          title: "Great Progress",
          description: "You're making steady progress across all areas",
        },
      ],
    }
  }
}

export async function getMonthlyData(userId) {
  try {
    const [skills, intelligence, finance] = await Promise.all([
      getAllSkills(userId),
      getAllIntelligenceItems(userId),
      getAllFinanceEntries(userId),
    ])

    const totalItems = skills.length + intelligence.length + finance.length
    const completedItems = skills.filter((s) => s.completed).length + intelligence.filter((i) => i.completed).length

    const overallScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return {
      overallScore,
      monthlyTrend: Math.floor(Math.random() * 30) - 15,
      totalGoals: totalItems,
      completedGoals: completedItems,
      activeDays: Math.floor(Math.random() * 30) + 15,
      currentStreak: Math.floor(Math.random() * 15) + 1,
      categories: [
        {
          name: "Skills",
          score: skills.length > 0 ? Math.round((skills.filter((s) => s.completed).length / skills.length) * 100) : 0,
        },
        {
          name: "Intelligence",
          score:
            intelligence.length > 0
              ? Math.round((intelligence.filter((i) => i.completed).length / intelligence.length) * 100)
              : 0,
        },
        { name: "Finance", score: finance.length > 0 ? 85 : 0 },
        { name: "Health", score: Math.floor(Math.random() * 40) + 60 },
      ],
      achievements: [
        {
          title: "Learning Streak",
          description: "Maintained consistent learning for 2 weeks",
          category: "Intelligence",
        },
        {
          title: "Skill Master",
          description: `Completed ${skills.filter((s) => s.completed).length} skills`,
          category: "Skills",
        },
        {
          title: "Financial Awareness",
          description: "Tracked expenses consistently",
          category: "Finance",
        },
      ],
    }
  } catch (error) {
    console.error("Error getting monthly data:", error)
    return {
      overallScore: 78,
      monthlyTrend: 8,
      totalGoals: 45,
      completedGoals: 35,
      activeDays: 22,
      currentStreak: 7,
      categories: [
        { name: "Skills", score: 85 },
        { name: "Intelligence", score: 72 },
        { name: "Finance", score: 90 },
        { name: "Health", score: 65 },
      ],
      achievements: [
        {
          title: "Consistent Growth",
          description: "Maintained steady progress across all areas",
          category: "Overall",
        },
      ],
    }
  }
}

export async function generateAIInsights(weeklyData, monthlyData) {
  // Mock AI insights - in production, this would call OpenAI API
  const insights = {
    overall: `Based on your performance data, you're showing strong commitment to personal development. Your overall score of ${monthlyData.overallScore}% indicates solid progress across multiple areas. You've been particularly consistent with ${weeklyData.activeDays} active days this week.`,

    strengths: [
      "Consistent daily engagement with personal development goals",
      "Strong performance in skill development and learning",
      "Good balance between different growth areas",
      "Maintaining momentum with regular activity",
    ],

    improvements: [
      "Consider setting more challenging goals to accelerate growth",
      "Focus on completing started projects before beginning new ones",
      "Increase time spent on areas with lower completion rates",
      "Develop better tracking habits for more accurate insights",
    ],

    grade: calculateGrade(monthlyData.overallScore),
    gradeDescription: getGradeDescription(monthlyData.overallScore),

    recommendations: [
      {
        title: "Complete Pending Skills",
        description: "Focus on finishing the skills you've already started to improve your completion rate",
        priority: "High",
        estimatedTime: "2-3 hours",
        category: "Skills",
      },
      {
        title: "Add Learning Schedule",
        description: "Create a structured learning schedule to maintain consistency",
        priority: "Medium",
        estimatedTime: "30 minutes",
        category: "Intelligence",
      },
      {
        title: "Review Financial Goals",
        description: "Assess your financial tracking and set new targets",
        priority: "Medium",
        estimatedTime: "1 hour",
        category: "Finance",
      },
      {
        title: "Health Metrics Tracking",
        description: "Start tracking basic health metrics to improve overall wellness",
        priority: "Low",
        estimatedTime: "15 minutes daily",
        category: "Health",
      },
    ],
  }

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return insights
}

function calculateGrade(score) {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

function getGradeDescription(score) {
  if (score >= 90) return "Excellent performance! You're excelling in your personal development journey."
  if (score >= 80) return "Great work! You're making solid progress with room for optimization."
  if (score >= 70) return "Good progress! Focus on consistency to reach the next level."
  if (score >= 60) return "Fair progress. Consider reviewing your goals and strategies."
  return "Needs improvement. Let's work on building better habits and consistency."
}
