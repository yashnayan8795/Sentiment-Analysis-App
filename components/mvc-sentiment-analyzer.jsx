"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

/**
 * MVC Sentiment Analyzer Component
 * Integrates the MVC architecture within React
 */
export default function MVCSentimentAnalyzer() {
  // State management (Controller layer)
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const { toast } = useToast()

  // Initialize component (Controller initialization)
  useEffect(() => {
    loadAnalysisHistory()
  }, [])

  // Service layer functions
  const analyzeArticle = async (url) => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate URL (Model validation)
      if (!url || !url.trim()) {
        throw new Error("Please enter a news article URL to analyze")
      }
      
      if (!url.startsWith("http")) {
        throw new Error("Please enter a valid URL starting with http:// or https://")
      }

      // API call (Service layer)
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to analyze article")
      }

      const data = await response.json()
      
      // Create analysis model
      const analysis = {
        id: data.id || `analysis-${Date.now()}`,
        url: data.url,
        title: data.heading,
        description: data.meta_description,
        summary: data.summary_with_sentiment,
        sentiment: data.overall_sentiment,
        score: data.score || 0,
        confidence: data.confidence || data.score || 0,
        timestamp: data.timestamp || new Date().toISOString()
      }

      setCurrentAnalysis(analysis)
      await saveToHistory(analysis)
      await loadAnalysisHistory()

      toast({
        title: "Analysis Complete",
        description: `Article sentiment: ${analysis.sentiment}`,
      })

      return analysis

    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch("/api/history")
      if (response.ok) {
        const data = await response.json()
        setAnalysisHistory(data.articles || [])
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    }
  }

  const saveToHistory = async (analysis) => {
    try {
      // Save to localStorage as fallback
      const existingHistory = JSON.parse(localStorage.getItem("recentAnalyses") || "[]")
      const newHistory = [analysis, ...existingHistory].slice(0, 10)
      localStorage.setItem("recentAnalyses", JSON.stringify(newHistory))
    } catch (error) {
      console.error("Failed to save to history:", error)
    }
  }

  const clearHistory = async () => {
    if (confirm("Are you sure you want to clear the analysis history?")) {
      try {
        await fetch("/api/history", { method: "DELETE" })
        setAnalysisHistory([])
        localStorage.removeItem("recentAnalyses")
        toast({
          title: "History Cleared",
          description: "Analysis history has been cleared",
        })
      } catch (error) {
        console.error("Failed to clear history:", error)
      }
    }
  }

  // Event handlers (Controller layer)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await analyzeArticle(url)
      setUrl("") // Clear input on success
    } catch (error) {
      // Error handling is done in analyzeArticle
    }
  }

  // View rendering functions
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 dark:text-green-400"
      case "negative":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-5 w-5" />
      case "negative":
        return <TrendingDown className="h-5 w-5" />
      default:
        return <Minus className="h-5 w-5" />
    }
  }

  const calculateSentimentValues = (sentiment, score) => {
    const confidence = Math.round((score || 0.5) * 100)
    
    let mainValue = 50
    let breakdown = { positive: 33, neutral: 34, negative: 33 }

    if (sentiment === "positive") {
      mainValue = Math.round(50 + (confidence * 0.5))
      breakdown = {
        positive: Math.max(confidence, 40),
        neutral: Math.round((100 - confidence) * 0.6),
        negative: Math.round((100 - confidence) * 0.4),
      }
    } else if (sentiment === "negative") {
      mainValue = Math.round(50 - (confidence * 0.5))
      breakdown = {
        negative: Math.max(confidence, 40),
        neutral: Math.round((100 - confidence) * 0.6),
        positive: Math.round((100 - confidence) * 0.4),
      }
    } else {
      mainValue = 50
      breakdown = {
        neutral: Math.max(60, 100 - confidence),
        positive: Math.round(confidence * 0.5),
        negative: Math.round(confidence * 0.5),
      }
    }

    return {
      mainValue: Math.min(100, Math.max(0, mainValue)),
      breakdown: {
        positive: Math.min(100, Math.max(0, breakdown.positive)),
        neutral: Math.min(100, Math.max(0, breakdown.neutral)),
        negative: Math.min(100, Math.max(0, breakdown.negative))
      }
    }
  }

  const formatUrl = (url) => {
    if (!url || url === "#") return "Unknown source"
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      return url.length > 30 ? url.substring(0, 30) + "..." : url
    }
  }

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        return "Recent"
      }
    } catch (e) {
      return "Unknown time"
    }
  }

  // Render the view
  return (
    <div className="space-y-8">
      {/* Analysis Form */}
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600 dark:text-slate-300">Analyzing article...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-2">Analysis Error</h3>
              <div className="text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Display */}
      {currentAnalysis && (
        <>
          <Card className="p-6 shadow-md">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {currentAnalysis.title}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {currentAnalysis.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">
                  Summary with Sentiment
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {currentAnalysis.summary}
                </p>
              </div>

              <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  Overall Sentiment
                </h3>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg ${getSentimentColor(currentAnalysis.sentiment)} bg-slate-100 dark:bg-slate-800`}
                >
                  {getSentimentIcon(currentAnalysis.sentiment)}
                  <span className="ml-2 font-medium capitalize">
                    {currentAnalysis.sentiment} ({Math.round((currentAnalysis.score || 0) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sentiment Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SentimentMeter 
              sentiment={currentAnalysis.sentiment} 
              value={calculateSentimentValues(currentAnalysis.sentiment, currentAnalysis.score).mainValue} 
            />
            <SentimentBreakdown
              positive={calculateSentimentValues(currentAnalysis.sentiment, currentAnalysis.score).breakdown.positive}
              neutral={calculateSentimentValues(currentAnalysis.sentiment, currentAnalysis.score).breakdown.neutral}
              negative={calculateSentimentValues(currentAnalysis.sentiment, currentAnalysis.score).breakdown.negative}
            />
          </div>
        </>
      )}

      {/* Recent Analyses */}
      <RecentAnalyses 
        analyses={analysisHistory}
        onRefresh={loadAnalysisHistory}
        onClear={clearHistory}
        formatUrl={formatUrl}
        formatTimestamp={formatTimestamp}
        getSentimentColor={getSentimentColor}
        getSentimentIcon={getSentimentIcon}
      />
    </div>
  )
}

// Sentiment Meter Component
function SentimentMeter({ sentiment, value }) {
  const getColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "#10b981"
      case "negative":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <motion.h3 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200"
      >
        Sentiment Meter
      </motion.h3>
      <motion.div 
        className="w-full aspect-[2/1] relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-48 h-24">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              stroke={getColor(sentiment)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${value * 3.6} 360`}
              strokeDashoffset="90"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold" style={{ color: getColor(sentiment) }}>
              {value}%
            </div>
            <div className="text-sm font-medium" style={{ color: getColor(sentiment) }}>
              {sentiment.toUpperCase()}
            </div>
          </div>
        </div>
      </motion.div>
    </Card>
  )
}

// Sentiment Breakdown Component
function SentimentBreakdown({ positive, neutral, negative }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <motion.h3 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200"
      >
        Sentiment Breakdown
      </motion.h3>
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Positive</span>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${positive}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">{Math.round(positive)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Neutral</span>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div 
                className="h-2 bg-gray-500 rounded-full transition-all duration-1000"
                style={{ width: `${neutral}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{Math.round(neutral)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Negative</span>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${negative}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{Math.round(negative)}%</span>
        </div>
      </motion.div>
    </Card>
  )
}

// Recent Analyses Component
function RecentAnalyses({ analyses, onRefresh, onClear, formatUrl, formatTimestamp, getSentimentColor, getSentimentIcon }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {analyses.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {analyses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">No recent analyses found</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs">Analyze some news articles to see them here</p>
          </div>
        ) : (
          analyses.map((item, index) => (
            <div key={item.id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2 mb-1">
                    {item.title || item.heading}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {item.url && item.url !== "#" ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        {formatUrl(item.url)}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      <span>{formatUrl(item.url)}</span>
                    )}
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)} bg-slate-100 dark:bg-slate-800`}>
                  {getSentimentIcon(item.sentiment)}
                  <span className="ml-1 capitalize">
                    {item.sentiment}
                  </span>
                  {item.score > 0 && (
                    <span className="ml-1 opacity-75">
                      ({Math.round(item.score * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
