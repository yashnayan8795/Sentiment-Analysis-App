"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function SentimentBreakdown({ positive, neutral, negative }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Adjust canvas dimensions for better scaling
    canvas.width = 400  // Reduced from 800
    canvas.height = 200 // Reduced from 400
    const width = canvas.width
    const height = canvas.height
    const barHeight = 30  // Reduced from 40
    const barSpacing = 20 // Reduced from 30
    const startY = height / 2 - (barHeight * 3 + barSpacing * 2) / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw bars with animation
    const drawBar = (y, value, color, label) => {
      // Background bar with gradient
      const bgGradient = ctx.createLinearGradient(100, y, width - 120, y)
      bgGradient.addColorStop(0, "#f3f4f6")
      bgGradient.addColorStop(1, "#e5e7eb")
      
      ctx.fillStyle = bgGradient
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
      ctx.shadowBlur = 5
      ctx.fillRect(100, y, width - 220, barHeight)
      ctx.shadowBlur = 0

      // Value bar with gradient
      const valueGradient = ctx.createLinearGradient(100, y, width - 120, y)
      valueGradient.addColorStop(0, color + "88")
      valueGradient.addColorStop(1, color)
      
      ctx.fillStyle = valueGradient
      ctx.fillRect(100, y, (width - 220) * (value / 100), barHeight)

      // Label with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 2
      ctx.font = "bold 14px Inter, system-ui, sans-serif" // Reduced from 16px
      ctx.fillStyle = "#4b5563"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(label, 80, y + barHeight / 2) // Adjusted position

      // Percentage with shadow
      ctx.font = "bold 14px Inter, system-ui, sans-serif"
      ctx.fillStyle = color
      ctx.textAlign = "left"
      ctx.fillText(`${Math.round(value)}%`, width - 100, y + barHeight / 2) // Adjusted position
    }

    // Draw each sentiment bar
    drawBar(startY, positive, "#10b981", "Positive")
    drawBar(startY + barHeight + barSpacing, neutral, "#6b7280", "Neutral")
    drawBar(startY + (barHeight + barSpacing) * 2, negative, "#ef4444", "Negative")
  }, [positive, neutral, negative])

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <motion.h3 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200"
      >
        Sentiment Breakdown
      </motion.h3>
      <motion.div 
        className="w-full aspect-[2/1] relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ transform: "scale(1)", transformOrigin: "center center" }} // Removed scaling
        />
      </motion.div>
    </Card>
  )
}