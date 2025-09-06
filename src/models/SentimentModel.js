/**
 * Sentiment Model - Handles sentiment analysis data and calculations
 */
export class SentimentModel {
  constructor(data = {}) {
    this.sentiment = data.sentiment || 'neutral' // positive, negative, neutral
    this.score = data.score || 0.5 // 0-1 confidence score
    this.breakdown = data.breakdown || { positive: 33, neutral: 34, negative: 33 }
    this.confidence = data.confidence || 0.5
    this.timestamp = data.timestamp || new Date().toISOString()
    this.isValid = this.validate()
  }

  /**
   * Validate sentiment data
   */
  validate() {
    const validSentiments = ['positive', 'negative', 'neutral']
    if (!validSentiments.includes(this.sentiment)) {
      return false
    }
    if (this.score < 0 || this.score > 1) {
      return false
    }
    if (this.confidence < 0 || this.confidence > 1) {
      return false
    }
    return true
  }

  /**
   * Calculate sentiment values for visualization
   */
  calculateVisualizationValues() {
    const confidence = Math.round(this.score * 100)
    
    let mainValue = 50 // Default neutral position
    let breakdown = { positive: 33, neutral: 34, negative: 33 }

    if (this.sentiment === 'positive') {
      mainValue = Math.round(50 + (confidence * 0.5))
      breakdown = {
        positive: Math.max(confidence, 40),
        neutral: Math.round((100 - confidence) * 0.6),
        negative: Math.round((100 - confidence) * 0.4),
      }
    } else if (this.sentiment === 'negative') {
      mainValue = Math.round(50 - (confidence * 0.5))
      breakdown = {
        negative: Math.max(confidence, 40),
        neutral: Math.round((100 - confidence) * 0.6),
        positive: Math.round((100 - confidence) * 0.4),
      }
    } else {
      mainValue = 50
      breakdown = {
        neutral: Math.max(60, 100 - confidence),
        positive: Math.round(confidence * 0.5),
        negative: Math.round(confidence * 0.5),
      }
    }

    return {
      mainValue: Math.min(100, Math.max(0, mainValue)),
      breakdown: {
        positive: Math.min(100, Math.max(0, breakdown.positive)),
        neutral: Math.min(100, Math.max(0, breakdown.neutral)),
        negative: Math.min(100, Math.max(0, breakdown.negative))
      }
    }
  }

  /**
   * Get sentiment color for UI
   */
  getColor() {
    switch (this.sentiment) {
      case 'positive':
        return '#10b981' // green-500
      case 'negative':
        return '#ef4444' // red-500
      default:
        return '#6b7280' // gray-500
    }
  }

  /**
   * Get sentiment display properties
   */
  getDisplayProperties() {
    return {
      color: this.getColor(),
      label: this.sentiment.charAt(0).toUpperCase() + this.sentiment.slice(1),
      percentage: Math.round(this.score * 100),
      confidence: Math.round(this.confidence * 100)
    }
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      sentiment: this.sentiment,
      score: this.score,
      breakdown: this.breakdown,
      confidence: this.confidence,
      timestamp: this.timestamp
    }
  }

  /**
   * Update sentiment data
   */
  update(data) {
    Object.assign(this, data)
    this.isValid = this.validate()
    return this
  }
}
