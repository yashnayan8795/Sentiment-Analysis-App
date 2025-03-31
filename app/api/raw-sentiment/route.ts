import { NextResponse } from "next/server"

// Define the backend URL - you should store this in an environment variable
const BACKEND_URL = "http://localhost:8000" // Update this to your FastAPI server URL

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
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

    // Return the raw data from FastAPI
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error analyzing article:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

