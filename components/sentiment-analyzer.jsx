"use client"

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

// Update the calculateSentimentValues function to use the sentiment score if available
const calculateSentimentValues = (sentiment, summary, score) => {
  // If we have a direct score from the API (0-1 range), use it for proper calculations
  if (score !== undefined && score >= 0 && score <= 1) {
    // Convert score to percentage and adjust based on sentiment
    const confidence = Math.round(score * 100)
    
    let mainValue = 50 // Default neutral position
    let breakdown = { positive: 33, neutral: 34, negative: 33 } // Default balanced

    if (sentiment === "positive") {
      // For positive sentiment: 50 + (confidence * 0.5) gives range 50-100
      mainValue = Math.round(50 + (confidence * 0.5))
      breakdown = {
        positive: Math.max(confidence, 40), // Ensure minimum visibility
        neutral: Math.round((100 - confidence) * 0.6),
        negative: Math.round((100 - confidence) * 0.4),
      }
    } else if (sentiment === "negative") {
      // For negative sentiment: 50 - (confidence * 0.5) gives range 0-50
      mainValue = Math.round(50 - (confidence * 0.5))
      breakdown = {
        negative: Math.max(confidence, 40), // Ensure minimum visibility
        neutral: Math.round((100 - confidence) * 0.6),
        positive: Math.round((100 - confidence) * 0.4),
      }
    } else {
      // Neutral sentiment
      mainValue = 50
      breakdown = {
        neutral: Math.max(60, 100 - confidence), // High neutral
        positive: Math.round(confidence * 0.5),
        negative: Math.round(confidence * 0.5),
      }
    }

    return {
      mainValue: Math.min(100, Math.max(0, mainValue)),
      breakdown,
    }
  }

  // Fallback calculation when no score is available
  const positiveCount = (summary.match(/\[Sentiment: Positive\]/g) || []).length
  const negativeCount = (summary.match(/\[Sentiment: Negative\]/g) || []).length
  const neutralCount = (summary.match(/\[Sentiment: Neutral\]/g) || []).length

  const total = positiveCount + negativeCount + neutralCount || 1

  const positive = Math.round((positiveCount / total) * 100)
  const negative = Math.round((negativeCount / total) * 100)
  const neutral = Math.round((neutralCount / total) * 100)

  let mainValue = 50
  if (sentiment === "positive") {
    mainValue = 75 + Math.round(positive / 4)
  } else if (sentiment === "negative") {
    mainValue = 25 - Math.round(negative / 4)
  }

  return {
    mainValue: Math.min(100, Math.max(0, mainValue)),
    breakdown: { positive, neutral, negative },
  }
}

export default function SentimentAnalyzer() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [sentimentValues, setSentimentValues] = useState({
    mainValue: 50,
    breakdown: { positive: 33, neutral: 34, negative: 33 },
  })
  const { toast } = useToast()

  // Update the handleSubmit function to pass the score to calculateSentimentValues
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic URL validation
    if (!url || !url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a news article URL to analyze",
        variant: "destructive",
      })
      return
    }

    if (!url.startsWith("http")) {
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
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        let errorMessage = errorData.message || "Failed to analyze article"
        
        // Format multi-line error messages for better display
        if (errorMessage.includes('\n')) {
          errorMessage = errorMessage.split('\n').join(' | ')
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResults(data)

      // Use the score from the main response first, fallback to raw API
      let score = data.score
      if (!score) {
        try {
          const rawResponse = await fetch(`${window.location.origin}/api/raw-sentiment?url=${encodeURIComponent(url)}`)
          if (rawResponse.ok) {
            const rawData = await rawResponse.json()
            score = rawData.score
          }
        } catch (e) {
          console.error("Could not fetch raw sentiment data:", e)
        }
      }

      // Calculate sentiment values for charts, using the available score
      const values = calculateSentimentValues(data.overall_sentiment, data.summary_with_sentiment, score)
      setSentimentValues(values)

      // Clear the input after successful analysis
      setUrl("")
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('analysisComplete', { detail: data }))
      
      // Show success message
      toast({
        title: "Analysis Complete",
        description: `Article sentiment: ${data.overall_sentiment}`,
        variant: "default",
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save analysis to recent history
  const saveToRecentAnalyses = (url, data) => {
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
          <div className="flex items-start text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-2">Analysis Error</h3>
              <div className="text-sm text-red-600 dark:text-red-300 whitespace-pre-line leading-relaxed">
                {error.split(' | ').map((line, index) => (
                  <div key={index} className="mb-1">
                    {line.startsWith('•') || line.startsWith('💡') ? (
                      <div className="ml-2">{line}</div>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
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

