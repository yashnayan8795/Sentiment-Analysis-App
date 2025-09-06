import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import MVCSentimentAnalyzer from "@/components/mvc-sentiment-analyzer"
import "./globals.css"

/**
 * Main Page Component - Entry point for the MVC application
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">
          News Sentiment Analyzer
        </h1>
        <p className="text-center mb-10 text-slate-600 dark:text-slate-300">
          Enter a news article URL to analyze its sentiment using AI
        </p>

        {/* MVC Application Component */}
        <Suspense fallback={
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Loading analyzer...</p>
            </div>
          </div>
        }>
          <MVCSentimentAnalyzer />
        </Suspense>
      </div>
      <Toaster />
    </main>
  )
}