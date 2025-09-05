"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RecentAnalyses() {
  const [analyses, setAnalyses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [source, setSource] = useState("")

  // Fetch history from the API
  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/history")
      if (response.ok) {
        const data = await response.json()
        console.log("History data received:", data) // Debug log
        
        // Handle both array and object responses
        let articles = []
        if (Array.isArray(data)) {
          articles = data
        } else if (data.articles && Array.isArray(data.articles)) {
          articles = data.articles
        }
        
        // Process and clean the articles data
        const processedArticles = articles
          .filter(article => article && (article.url || article.id)) // Filter out invalid entries
          .map(article => ({
            id: article.id || article.url || `article-${Date.now()}-${Math.random()}`,
            url: article.url || "#",
            title: article.title || article.heading || "Untitled Article",
            sentiment: (article.sentiment || "neutral").toLowerCase(),
            timestamp: article.timestamp || new Date().toISOString(),
            score: article.score || 0
          }))
          .slice(0, 20) // Limit to recent 20 analyses
        
        setAnalyses(processedArticles)
        setSource(data.source || "api")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch history when component mounts
    fetchHistory()

    // Also listen for storage events to update when new analyses are added
    const handleStorageChange = () => {
      fetchHistory()
    }

    // Listen for custom events that might indicate new analyses
    const handleAnalysisComplete = () => {
      setTimeout(fetchHistory, 1000) // Small delay to ensure backend has processed
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("analysisComplete", handleAnalysisComplete)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("analysisComplete", handleAnalysisComplete)
    }
  }, [])

  // Get sentiment icon and color
  const getSentimentDisplay = (sentiment) => {
    const normalizedSentiment = sentiment?.toLowerCase() || "neutral"
    
    switch (normalizedSentiment) {
      case "positive":
        return {
          icon: <TrendingUp className="h-4 w-4 text-green-500" />,
          color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
        }
      case "negative":
        return {
          icon: <TrendingDown className="h-4 w-4 text-red-500" />,
          color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
        }
      default:
        return {
          icon: <Minus className="h-4 w-4 text-gray-500" />,
          color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400"
        }
    }
  }

  // Format URL for display
  const formatUrl = (url) => {
    if (!url || url === "#") return "Unknown source"
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      return url.length > 30 ? url.substring(0, 30) + "..." : url
    }
  }

  // Format timestamp
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

  // Clear history - this would need a backend endpoint to actually clear the MongoDB collection
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear the analysis history?")) {
      setAnalyses([])
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-center py-4">
          <p className="text-red-500 dark:text-red-400 text-sm mb-2">Failed to load history</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{error}</p>
        </div>
      </Card>
    )
  }

  if (analyses.length === 0 && !isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">No recent analyses found</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs">Analyze some news articles to see them here</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
          {source && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} 
              {source === 'memory' ? ' (session only)' : ' (stored)'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          {analyses.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {analyses.map((item, index) => {
          const sentimentDisplay = getSentimentDisplay(item.sentiment)
          
          return (
            <div key={item.id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2 mb-1">
                    {item.title}
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
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${sentimentDisplay.color}`}>
                  {sentimentDisplay.icon}
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
          )
        })}
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      )}
    </Card>
  )
}