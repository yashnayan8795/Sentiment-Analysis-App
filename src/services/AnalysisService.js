/**
 * Analysis Service - Handles business logic for sentiment analysis
 */
import { AnalysisModel } from '../models/AnalysisModel.js'

export class AnalysisService {
  constructor(apiClient, storageService) {
    this.apiClient = apiClient
    this.storageService = storageService
  }

  /**
   * Analyze article from URL
   */
  async analyzeArticle(url) {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL format. Please provide a valid URL starting with http:// or https://')
      }

      // Call API to analyze article
      const response = await this.apiClient.analyze(url)
      
      // Create analysis model from response
      const analysis = AnalysisModel.fromApiResponse(response)
      
      // Store analysis in local storage
      await this.storageService.saveAnalysis(analysis)
      
      return analysis
    } catch (error) {
      console.error('Analysis service error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory(limit = 20) {
    try {
      // Try to get from API first
      const apiHistory = await this.apiClient.getHistory()
      
      // Convert API responses to AnalysisModel instances
      const analyses = apiHistory.map(data => AnalysisModel.fromApiResponse(data))
      
      // Get local storage history as fallback
      const localHistory = await this.storageService.getAnalysisHistory(limit)
      
      // Combine and deduplicate
      const combinedHistory = this.combineHistories(analyses, localHistory)
      
      return combinedHistory.slice(0, limit)
    } catch (error) {
      console.error('History service error:', error)
      // Fallback to local storage only
      return await this.storageService.getAnalysisHistory(limit)
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id) {
    try {
      // Try local storage first
      const localAnalysis = await this.storageService.getAnalysisById(id)
      if (localAnalysis) {
        return localAnalysis
      }
      
      // Fallback to API if needed
      const apiAnalysis = await this.apiClient.getAnalysisById(id)
      return AnalysisModel.fromApiResponse(apiAnalysis)
    } catch (error) {
      console.error('Get analysis error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Clear analysis history
   */
  async clearHistory() {
    try {
      await this.storageService.clearHistory()
      return true
    } catch (error) {
      console.error('Clear history error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Combine API and local histories
   */
  combineHistories(apiHistory, localHistory) {
    const combined = [...apiHistory]
    const apiIds = new Set(apiHistory.map(a => a.id))
    
    // Add local history items not in API history
    localHistory.forEach(local => {
      if (!apiIds.has(local.id)) {
        combined.push(local)
      }
    })
    
    // Sort by timestamp (newest first)
    return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  /**
   * Handle and format errors
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message

      switch (status) {
        case 400:
          return new Error('Invalid request. Please check your input.')
        case 401:
          return new Error('Unauthorized access. Please check your credentials.')
        case 403:
          return new Error('Access forbidden. You don\'t have permission to perform this action.')
        case 404:
          return new Error('Resource not found.')
        case 429:
          return new Error('Too many requests. Please wait before trying again.')
        case 500:
          return new Error('Server error. Please try again later.')
        default:
          return new Error(message || 'An unexpected error occurred.')
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection.')
    } else {
      return new Error(error.message || 'An unexpected error occurred.')
    }
  }
}
