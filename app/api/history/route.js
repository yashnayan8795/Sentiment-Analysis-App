import { NextResponse } from "next/server"

// Get backend URL from environment variable with fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

/**
 * GET /api/history - Get analysis history
 * Controller: Handles the API request and delegates to backend service
 */
export async function GET() {
  try {
    // Call backend service
    const response = await fetch(`${BACKEND_URL}/history/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Handle backend response
    if (!response.ok) {
      let errorMessage = "Failed to fetch history"
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (e) {
        errorMessage = `Backend service error (${response.status})`
      }
      return NextResponse.json({ 
        message: errorMessage,
        articles: [], // Return empty array to prevent frontend crashes
        source: "error"
      }, { status: response.status })
    }

    // Transform backend response to frontend format
    const data = await response.json()
    const transformedArticles = (data.articles || []).map((article) => ({
      id: article.url || article.id || `article-${Date.now()}-${Math.random()}`,
      url: article.url || "#",
      title: article.heading || article.title || "Untitled Article",
      sentiment: (article.sentiment || "neutral").toLowerCase(),
      score: typeof article.score === 'number' ? article.score : 0,
      confidence: article.score || 0,
      timestamp: article.timestamp || new Date().toISOString(),
    }))

    return NextResponse.json({ 
      articles: transformedArticles,
      source: data.source || "database",
      message: data.message || undefined
    })
  } catch (error) {
    console.error("Error fetching history:", error)
    
    let errorMessage = "Unable to load analysis history"
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Backend service is not available"
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Request timed out while loading history"
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      articles: [],
      source: "error"
    }, { status: 500 })
  }
}