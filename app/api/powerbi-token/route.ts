import { NextResponse } from "next/server"

export async function GET() {
  try {
    // You'll need to implement Azure AD authentication here
    // and get an access token for Power BI REST API
    const embedToken = await getPowerBIToken()

    return NextResponse.json({ accessToken: embedToken })
  } catch (error) {
    console.error("Error getting Power BI token:", error)
    return NextResponse.json(
      { message: "Failed to get Power BI token" },
      { status: 500 }
    )
  }
} 