/**
 * Analysis Model - Combines article and sentiment data
 */
import { ArticleModel } from './ArticleModel.js'
import { SentimentModel } from './SentimentModel.js'

export class AnalysisModel {
  constructor(data = {}) {
    this.id = data.id || this.generateId()
    this.article = new ArticleModel(data.article || {})
    this.sentiment = new SentimentModel(data.sentiment || {})
    this.summary = data.summary || ''
    this.rawData = data.rawData || {}
    this.timestamp = data.timestamp || new Date().toISOString()
    this.isValid = this.validate()
  }

  /**
   * Validate analysis data
   */
  validate() {
    return this.article.isValid && this.sentiment.isValid
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * Get analysis summary for display
   */
  getSummary() {
    return {
      title: this.article.title,
      url: this.article.url,
      sentiment: this.sentiment.sentiment,
      score: this.sentiment.score,
      confidence: this.sentiment.confidence,
      summary: this.summary,
      timestamp: this.timestamp
    }
  }

  /**
   * Get visualization data
   */
  getVisualizationData() {
    return {
      sentiment: this.sentiment.sentiment,
      values: this.sentiment.calculateVisualizationValues(),
      display: this.sentiment.getDisplayProperties()
    }
  }

  /**
   * Get formatted timestamp
   */
  getFormattedTimestamp() {
    try {
      const date = new Date(this.timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        return 'Recent'
      }
    } catch (e) {
      return 'Unknown time'
    }
  }

  /**
   * Convert to API format
   */
  toApiFormat() {
    return {
      id: this.id,
      url: this.article.url,
      heading: this.article.title,
      meta_description: this.article.description,
      summary_with_sentiment: this.summary,
      overall_sentiment: this.sentiment.sentiment,
      score: this.sentiment.score,
      timestamp: this.timestamp
    }
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      id: this.id,
      article: this.article.toObject(),
      sentiment: this.sentiment.toObject(),
      summary: this.summary,
      rawData: this.rawData,
      timestamp: this.timestamp
    }
  }

  /**
   * Update analysis data
   */
  update(data) {
    if (data.article) {
      this.article.update(data.article)
    }
    if (data.sentiment) {
      this.sentiment.update(data.sentiment)
    }
    if (data.summary) {
      this.summary = data.summary
    }
    if (data.rawData) {
      this.rawData = data.rawData
    }
    this.isValid = this.validate()
    return this
  }

  /**
   * Create from API response
   */
  static fromApiResponse(apiData) {
    return new AnalysisModel({
      id: apiData.id || apiData.url,
      article: {
        url: apiData.url,
        title: apiData.heading,
        description: apiData.meta_description,
        content: apiData.content || ''
      },
      sentiment: {
        sentiment: apiData.overall_sentiment,
        score: apiData.score,
        confidence: apiData.confidence || apiData.score
      },
      summary: apiData.summary_with_sentiment,
      timestamp: apiData.timestamp
    })
  }
}
