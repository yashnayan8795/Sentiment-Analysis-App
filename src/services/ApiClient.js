/**
 * API Client - Handles communication with backend API
 */
export class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Analyze article URL
   */
  async analyze(url) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API analyze error:', error)
      throw error
    }
  }

  /**
   * Get analysis history
   */
  async getHistory() {
    try {
      const response = await fetch(`${this.baseUrl}/history`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.articles || []
    } catch (error) {
      console.error('API history error:', error)
      throw error
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/analysis/${id}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API get analysis error:', error)
      throw error
    }
  }

  /**
   * Get raw sentiment data
   */
  async getRawSentiment(url) {
    try {
      const response = await fetch(`${this.baseUrl}/raw-sentiment?url=${encodeURIComponent(url)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API raw sentiment error:', error)
      throw error
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error('API health check error:', error)
      return false
    }
  }

  /**
   * Test simple endpoint
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/test-simple`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API test connection error:', error)
      throw error
    }
  }
}
