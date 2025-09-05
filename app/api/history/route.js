import { NextResponse } from "next/server"

// Get backend URL from environment variable with fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function GET() {
  try {
    // Make request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/history/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

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

    const data = await response.json()

    // Transform the data to match our frontend's expected format
    const transformedArticles = (data.articles || []).map((article) => ({
      id: article.url || article.id || `article-${Date.now()}-${Math.random()}`, // Using URL as ID since MongoDB _id is excluded
      url: article.url || "#",
      title: article.heading || article.title || "Untitled Article",
      sentiment: (article.sentiment || "neutral").toLowerCase(),
      timestamp: article.timestamp || new Date().toISOString(), // Use timestamp if available or current time
      score: typeof article.score === 'number' ? article.score : 0,
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