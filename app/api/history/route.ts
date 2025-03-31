import { NextResponse } from "next/server"

// Define the backend URL - you should store this in an environment variable
const BACKEND_URL = "http://localhost:8000" // Update this to your FastAPI server URL

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
      const errorData = await response.json()
      return NextResponse.json({ message: errorData.detail || "Failed to fetch history" }, { status: response.status })
    }

    const data = await response.json()

    // Transform the data to match our frontend's expected format
    const transformedArticles = data.articles.map((article: any) => ({
      id: article.url, // Using URL as ID since MongoDB _id is excluded
      url: article.url,
      title: article.heading,
      sentiment: article.sentiment.toLowerCase(),
      timestamp: article.timestamp || new Date().toISOString(), // Use timestamp if available or current time
      score: article.score,
    }))

    return NextResponse.json({ articles: transformedArticles })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

