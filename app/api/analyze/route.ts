import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

// Define the backend URL - you should store this in an environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    // Rate limiting
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { message: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { message: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Make request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/analyze/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: errorData.detail || "Failed to analyze article" },
        { status: response.status },
      )
    }

    // Get the raw data from FastAPI
    const data = await response.json()

    // Transform the data to match our frontend's expected format
    const transformedData = {
      heading: data.heading,
      meta_description: data.summary,
      // Create a summary with sentiment format that our frontend expects
      summary_with_sentiment: `${data.summary} [Sentiment: ${data.sentiment}]`,
      // Map the sentiment label to our expected format (lowercase)
      overall_sentiment:
        data.sentiment.toLowerCase() === "positive"
          ? "positive"
          : data.sentiment.toLowerCase() === "negative"
            ? "negative"
            : "neutral",
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error analyzing article:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

