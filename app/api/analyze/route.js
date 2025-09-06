import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

// Define the backend URL - you should store this in an environment variable
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

/**
 * POST /api/analyze - Analyze article sentiment
 * Controller: Handles the API request and delegates to backend service
 */
export async function POST(request) {
  try {
    // Rate limiting check
    const limiter = await rateLimit(request)
    if (!limiter.success) {
      return NextResponse.json(
        { 
          message: 'Too many requests. Please wait before analyzing another article.',
          resetTime: new Date(limiter.reset).toISOString()
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { url } = body

    // Input validation
    if (!url) {
      return NextResponse.json(
        { message: "URL is required. Please provide a news article URL." },
        { status: 400 }
      )
    }

    // URL format validation
    try {
      const urlObj = new URL(url)
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { message: "Invalid URL format. Please provide a valid URL starting with http:// or https://" },
        { status: 400 }
      )
    }

    // Call backend service
    const response = await fetch(`${BACKEND_URL}/analyze/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    // Handle backend response
    if (!response.ok) {
      let errorMessage = "Failed to analyze article"
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (e) {
        // If can't parse error response, use status-based message
        if (response.status === 400) {
          errorMessage = "Unable to access or analyze the provided URL"
        } else if (response.status === 500) {
          errorMessage = "Server error while processing the article"
        } else if (response.status >= 400 && response.status < 500) {
          errorMessage = "Client error: Please check your URL and try again"
        } else {
          errorMessage = "Unexpected error occurred during analysis"
        }
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status },
      )
    }

    // Transform backend response to frontend format
    const data = await response.json()
    const transformedData = {
      id: data.url || `analysis-${Date.now()}`,
      url: data.url || url,
      heading: data.heading || "No Title",
      meta_description: data.summary || "",
      summary_with_sentiment: data.summary || "No summary available",
      overall_sentiment: (data.sentiment || "neutral").toLowerCase(),
      score: data.score || 0,
      confidence: data.score || 0,
      timestamp: data.timestamp || new Date().toISOString()
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error analyzing article:", error)
    
    let errorMessage = "Internal server error occurred while analyzing the article"
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Backend service is not available. Please try again later."
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Request timed out. The article might be taking too long to process."
    } else if (error.message.includes('fetch')) {
      errorMessage = "Network error: Unable to connect to analysis service."
    }
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}