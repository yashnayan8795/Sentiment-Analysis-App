"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function SentimentMeter({ sentiment, value }) {
  const canvasRef = useRef(null)

  // Get color based on sentiment
  const getColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "#10b981" // green-500
      case "negative":
        return "#ef4444" // red-500
      default:
        return "#6b7280" // gray-500
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Adjust canvas dimensions for better scaling
    canvas.width = 400
    canvas.height = 200
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height
    const radius = Math.min(width, height) * 0.8

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Add gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.05)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw background arc with shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.lineWidth = 30
    ctx.strokeStyle = "#e5e7eb" // gray-200
    ctx.stroke()
    ctx.shadowBlur = 0

    // Calculate angle based on sentiment value (0-100)
    let startAngle, endAngle;
    let displayValue;
    
    if (sentiment === "negative") {
      startAngle = 0;
      endAngle = Math.PI * (value / 100);
      displayValue = Math.round(value); // Round the value
    } else {
      startAngle = Math.PI;
      endAngle = Math.PI * (1 - value / 100);
      displayValue = Math.round(value); // Round the value
    }

    // Draw sentiment arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, sentiment === "negative");
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.strokeStyle = getColor(sentiment);
    ctx.stroke();

    // Draw the value text with rounded number
    ctx.font = "bold 36px Inter, system-ui, sans-serif";
    ctx.fillStyle = getColor(sentiment);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${displayValue}%`, centerX, centerY - radius / 2);

    // Draw sentiment text
    ctx.font = "20px Inter, system-ui, sans-serif"
    ctx.fillStyle = getColor(sentiment)
    ctx.fillText(sentiment.toUpperCase(), centerX, centerY - radius / 4)
  }, [sentiment, value])

  return (
    <Card className="p-6 flex flex-col items-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <motion.h3 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200"
      >
        Sentiment Meter
      </motion.h3>
      <motion.div 
        className="w-full aspect-[2/1] relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ transform: "scale(1)", transformOrigin: "center center" }}
        />
      </motion.div>
    </Card>
  )
}