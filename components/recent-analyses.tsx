"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisItem {
  id: string
  url: string
  title: string
  sentiment: "positive" | "neutral" | "negative"
  timestamp: string
  score?: number
}

export default function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch history from the API
  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/history")
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.articles || [])
      }
    } catch (error) {
      console.error("Error fetching history:", error)
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

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Get sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch (e) {
      return url
    }
  }

  // Clear history - this would need a backend endpoint to actually clear the MongoDB collection
  const clearHistory = () => {
    setAnalyses([])
  }

  if (analyses.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">No recent analyses found.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Recent Analyses</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
        </div>
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {analyses.map((item) => (
          <div key={item.id} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</h4>
                <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-primary"
                  >
                    {formatUrl(item.url)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="mx-2">•</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {getSentimentIcon(item.sentiment)}
                <span className="ml-1 text-xs font-medium capitalize">
                  {item.sentiment}
                  {item.score !== undefined && ` (${Math.round(item.score * 100)}%)`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

