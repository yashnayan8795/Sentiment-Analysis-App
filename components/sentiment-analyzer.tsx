"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import ResultsDisplay from "./results-display"
import SentimentMeter from "./sentiment-meter"
import SentimentBreakdown from "./sentiment-breakdown"
import RecentAnalyses from "./recent-analyses"
import { v4 as uuidv4 } from "uuid"

// Update the SentimentResponse interface to match the transformed data from our API
interface SentimentResponse {
  heading: string
  meta_description: string
  summary_with_sentiment: string
  overall_sentiment: "positive" | "neutral" | "negative"
}

// Update the calculateSentimentValues function to use the sentiment score if available
const calculateSentimentValues = (sentiment: "positive" | "neutral" | "negative", summary: string, score?: number) => {
  // If we have a direct score from the API (0-1 range), use it
  if (score !== undefined) {
    // Convert score to our 0-100 scale
    const mainValue = sentiment === "positive" ? 50 + score * 50 : sentiment === "negative" ? 50 - score * 50 : 50

    // Create breakdown based on the sentiment and score
    let breakdown = { positive: 33, neutral: 34, negative: 33 } // Default balanced

    if (sentiment === "positive") {
      const positiveValue = Math.round(score * 100)
      breakdown = {
        positive: positiveValue,
        neutral: Math.round((100 - positiveValue) / 2),
        negative: Math.round((100 - positiveValue) / 2),
      }
    } else if (sentiment === "negative") {
      const negativeValue = Math.round(score * 100)
      breakdown = {
        negative: negativeValue,
        neutral: Math.round((100 - negativeValue) / 2),
        positive: Math.round((100 - negativeValue) / 2),
      }
    }

    return {
      mainValue: Math.min(100, Math.max(0, mainValue)),
      breakdown,
    }
  }

  // Fallback to the original calculation if no score is provided
  // Count sentiment mentions in summary
  const positiveCount = (summary.match(/\[Sentiment: Positive\]/g) || []).length
  const negativeCount = (summary.match(/\[Sentiment: Negative\]/g) || []).length
  const neutralCount = (summary.match(/\[Sentiment: Neutral\]/g) || []).length

  const total = positiveCount + negativeCount + neutralCount || 1 // Avoid division by zero

  // Calculate percentages
  const positive = Math.round((positiveCount / total) * 100)
  const negative = Math.round((negativeCount / total) * 100)
  const neutral = Math.round((neutralCount / total) * 100)

  // Calculate main sentiment value (0-100)
  let mainValue = 50 // Default neutral
  if (sentiment === "positive") {
    mainValue = 75 + Math.round(positive / 4)
  } else if (sentiment === "negative") {
    mainValue = 25 - Math.round(negative / 4)
  }

  return {
    mainValue: Math.min(100, Math.max(0, mainValue)),
    breakdown: {
      positive,
      neutral,
      negative,
    },
  }
}

export default function SentimentAnalyzer() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SentimentResponse | null>(null)
  const [sentimentValues, setSentimentValues] = useState({
    mainValue: 50,
    breakdown: { positive: 33, neutral: 34, negative: 33 },
  })
  const { toast } = useToast()

  // Update the handleSubmit function to pass the score to calculateSentimentValues
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic URL validation
    if (!url || !url.startsWith("http")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to analyze article")
      }

      const data = await response.json()
      setResults(data)

      // Get the score from the raw response if available
      let score
      try {
        const rawResponse = await fetch(`${window.location.origin}/api/raw-sentiment?url=${encodeURIComponent(url)}`)
        if (rawResponse.ok) {
          const rawData = await rawResponse.json()
          score = rawData.score
        }
      } catch (e) {
        console.error("Could not fetch raw sentiment data:", e)
      }

      // Calculate sentiment values for charts, passing the score if available
      const values = calculateSentimentValues(data.overall_sentiment, data.summary_with_sentiment, score)
      setSentimentValues(values)

      // No need to save to localStorage as we're now using the API history
      // The RecentAnalyses component will fetch from the API
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save analysis to recent history
  const saveToRecentAnalyses = (url: string, data: SentimentResponse) => {
    const newAnalysis = {
      id: uuidv4(),
      url,
      title: data.heading,
      sentiment: data.overall_sentiment,
      timestamp: new Date().toISOString(),
    }

    // Get existing analyses from localStorage
    const existingAnalysesJson = localStorage.getItem("recentAnalyses")
    const existingAnalyses = existingAnalysesJson ? JSON.parse(existingAnalysesJson) : []

    // Add new analysis to the beginning of the array and limit to 10 items
    const updatedAnalyses = [newAnalysis, ...existingAnalyses].slice(0, 10)

    // Save back to localStorage
    localStorage.setItem("recentAnalyses", JSON.stringify(updatedAnalyses))

    // Trigger a refresh of the RecentAnalyses component
    window.dispatchEvent(new Event("storage"))
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              News Article URL
            </label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/news-article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600 dark:text-slate-300">Analyzing article...</span>
        </div>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
        </Card>
      )}

      {results && (
        <>
          <ResultsDisplay results={results} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SentimentMeter sentiment={results.overall_sentiment} value={sentimentValues.mainValue} />
            <SentimentBreakdown
              positive={sentimentValues.breakdown.positive}
              neutral={sentimentValues.breakdown.neutral}
              negative={sentimentValues.breakdown.negative}
            />
          </div>
        </>
      )}

      <RecentAnalyses />
    </div>
  )
}

