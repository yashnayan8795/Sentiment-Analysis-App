/**
 * Analysis Controller - Handles analysis-related business logic and state management
 */
import { AnalysisService } from '../services/AnalysisService.js'
import { StorageService } from '../services/StorageService.js'
import { ApiClient } from '../services/ApiClient.js'

export class AnalysisController {
  constructor() {
    this.apiClient = new ApiClient()
    this.storageService = new StorageService()
    this.analysisService = new AnalysisService(this.apiClient, this.storageService)
    
    // State
    this.currentAnalysis = null
    this.analysisHistory = []
    this.isLoading = false
    this.error = null
    
    // Event listeners
    this.listeners = new Map()
  }

  /**
   * Initialize controller
   */
  async initialize() {
    try {
      this.isLoading = true
      this.error = null
      
      // Load analysis history
      await this.loadAnalysisHistory()
      
      this.emit('initialized')
    } catch (error) {
      this.error = error.message
      this.emit('error', error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Analyze article from URL
   */
  async analyzeArticle(url) {
    try {
      this.isLoading = true
      this.error = null
      this.emit('analysisStarted')
      
      // Validate URL
      if (!url || !url.trim()) {
        throw new Error('Please enter a news article URL to analyze')
      }
      
      if (!url.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://')
      }
      
      // Perform analysis
      const analysis = await this.analysisService.analyze(url.trim())
      
      // Update state
      this.currentAnalysis = analysis
      
      // Refresh history
      await this.loadAnalysisHistory()
      
      this.emit('analysisCompleted', analysis)
      return analysis
      
    } catch (error) {
      this.error = error.message
      this.emit('analysisError', error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Load analysis history
   */
  async loadAnalysisHistory(limit = 20) {
    try {
      this.analysisHistory = await this.analysisService.getAnalysisHistory(limit)
      this.emit('historyLoaded', this.analysisHistory)
      return this.analysisHistory
    } catch (error) {
      console.error('Failed to load analysis history:', error)
      this.emit('historyError', error)
      return []
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id) {
    try {
      const analysis = await this.analysisService.getAnalysisById(id)
      if (analysis) {
        this.currentAnalysis = analysis
        this.emit('analysisLoaded', analysis)
      }
      return analysis
    } catch (error) {
      this.error = error.message
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Clear analysis history
   */
  async clearHistory() {
    try {
      await this.analysisService.clearHistory()
      this.analysisHistory = []
      this.emit('historyCleared')
      return true
    } catch (error) {
      this.error = error.message
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Get current analysis
   */
  getCurrentAnalysis() {
    return this.currentAnalysis
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory() {
    return this.analysisHistory
  }

  /**
   * Get loading state
   */
  isLoading() {
    return this.isLoading
  }

  /**
   * Get error state
   */
  getError() {
    return this.error
  }

  /**
   * Clear error
   */
  clearError() {
    this.error = null
    this.emit('errorCleared')
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats() {
    const total = this.analysisHistory.length
    const sentiments = this.analysisHistory.reduce((acc, analysis) => {
      const sentiment = analysis.sentiment.sentiment
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {})

    return {
      totalAnalyses: total,
      sentimentDistribution: sentiments,
      averageScore: this.analysisHistory.length > 0 
        ? this.analysisHistory.reduce((sum, a) => sum + a.sentiment.score, 0) / total
        : 0
    }
  }

  /**
   * Export analysis data
   */
  async exportData() {
    try {
      return await this.storageService.exportHistory()
    } catch (error) {
      this.error = error.message
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Import analysis data
   */
  async importData(jsonData) {
    try {
      const importedCount = await this.storageService.importHistory(jsonData)
      await this.loadAnalysisHistory()
      this.emit('dataImported', importedCount)
      return importedCount
    } catch (error) {
      this.error = error.message
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.listeners.clear()
    this.currentAnalysis = null
    this.analysisHistory = []
    this.isLoading = false
    this.error = null
  }
}
