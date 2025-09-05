"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, BarChart3, Settings } from "lucide-react"

export default function PowerBIDashboard({ reportId, workspaceId }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [embedToken, setEmbedToken] = useState(null)

  useEffect(() => {
    // Simulate loading and show placeholder
    const timer = setTimeout(() => {
      setIsLoading(false)
      // For now, we'll show a placeholder since PowerBI integration isn't fully configured
      setError("PowerBI integration is not yet configured. Please set up Azure AD authentication and PowerBI workspace.")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const fetchPowerBIToken = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/powerbi-token')
      if (response.ok) {
        const data = await response.json()
        setEmbedToken(data.accessToken)
        setError(null)
      } else {
        throw new Error('Failed to fetch PowerBI token')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PowerBI dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading PowerBI Dashboard...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400 mb-4" />
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            PowerBI Dashboard Unavailable
          </h3>
          <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md">
            {error}
          </p>
          <div className="flex gap-3">
            <Button onClick={fetchPowerBIToken} variant="outline" className="border-amber-300">
              <Settings className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            <Button asChild variant="default">
              <a href="/" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics Instead
              </a>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // This would be the actual PowerBI embed code when properly configured
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Sentiment Analysis Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Advanced analytics and insights from your sentiment analysis data
        </p>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-8 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-24 w-24 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            PowerBI Dashboard Placeholder
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Report ID: {reportId}<br />
            Workspace ID: {workspaceId}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
            Configure Azure AD authentication and PowerBI workspace to enable full dashboard functionality.
          </p>
        </div>
      </div>
    </Card>
  )
}