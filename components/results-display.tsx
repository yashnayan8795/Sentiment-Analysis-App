"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SentimentResponse {
  heading: string
  meta_description: string
  summary_with_sentiment: string
  overall_sentiment: "positive" | "neutral" | "negative"
}

interface ResultsDisplayProps {
  results: SentimentResponse
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { heading, meta_description, summary_with_sentiment, overall_sentiment } = results

  // Split the summary by sentiment indicators
  const summaryParts = summary_with_sentiment.split(/(\[Sentiment: (?:Positive|Negative|Neutral)\])/g)

  // Get sentiment color and icon
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "text-green-600 dark:text-green-400"
      case "negative":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <TrendingUp className="h-5 w-5" />
      case "negative":
        return <TrendingDown className="h-5 w-5" />
      default:
        return <Minus className="h-5 w-5" />
    }
  }

  const overallSentimentColor = getSentimentColor(overall_sentiment)
  const overallSentimentIcon = getSentimentIcon(overall_sentiment)

  return (
    <Card className="p-6 shadow-md">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{heading}</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{meta_description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-200">Summary with Sentiment</h3>
          <div className="space-y-2">
            {summaryParts.map((part, index) => {
              if (part.startsWith("[Sentiment:")) {
                const sentiment = part.match(/\[Sentiment: (.*?)\]/)?.[1] || ""
                return (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(sentiment)} bg-slate-100 dark:bg-slate-800 ml-2`}
                  >
                    {getSentimentIcon(sentiment)}
                    <span className="ml-1">{sentiment}</span>
                  </span>
                )
              }
              return <span key={index}>{part}</span>
            })}
          </div>
        </div>

        <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">Overall Sentiment</h3>
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-lg ${overallSentimentColor} bg-slate-100 dark:bg-slate-800`}
          >
            {overallSentimentIcon}
            <span className="ml-2 font-medium capitalize">{overall_sentiment}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

