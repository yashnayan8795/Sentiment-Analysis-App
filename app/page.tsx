import { Suspense } from "react"
import SentimentAnalyzer from "@/components/sentiment-analyzer"
import { Toaster } from "@/components/ui/toaster"

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

        <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading analyzer...</div>}>
          <SentimentAnalyzer />
        </Suspense>
      </div>
      <Toaster />
    </main>
  )
}

