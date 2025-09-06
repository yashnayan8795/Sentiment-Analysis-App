/**
 * Storage Service - Handles data persistence and retrieval
 */
import { AnalysisModel } from '../models/AnalysisModel.js'

export class StorageService {
  constructor() {
    this.storageKey = 'sentiment-analysis-history'
    this.maxItems = 50
  }

  /**
   * Save analysis to local storage
   */
  async saveAnalysis(analysis) {
    try {
      const history = await this.getAnalysisHistory()
      
      // Remove existing analysis with same ID if exists
      const filteredHistory = history.filter(item => item.id !== analysis.id)
      
      // Add new analysis to beginning
      const updatedHistory = [analysis, ...filteredHistory].slice(0, this.maxItems)
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory.map(a => a.toObject())))
      
      return analysis
    } catch (error) {
      console.error('Storage save error:', error)
      throw new Error('Failed to save analysis to local storage')
    }
  }

  /**
   * Get analysis history from local storage
   */
  async getAnalysisHistory(limit = 20) {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return []
      }

      const historyData = JSON.parse(stored)
      const analyses = historyData.map(data => new AnalysisModel(data))
      
      return analyses.slice(0, limit)
    } catch (error) {
      console.error('Storage retrieval error:', error)
      return []
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id) {
    try {
      const history = await this.getAnalysisHistory()
      return history.find(analysis => analysis.id === id) || null
    } catch (error) {
      console.error('Storage get by ID error:', error)
      return null
    }
  }

  /**
   * Clear all analysis history
   */
  async clearHistory() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      throw new Error('Failed to clear analysis history')
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const history = await this.getAnalysisHistory()
      return {
        totalAnalyses: history.length,
        oldestAnalysis: history[history.length - 1]?.timestamp,
        newestAnalysis: history[0]?.timestamp,
        storageUsed: this.calculateStorageSize()
      }
    } catch (error) {
      console.error('Storage stats error:', error)
      return {
        totalAnalyses: 0,
        oldestAnalysis: null,
        newestAnalysis: null,
        storageUsed: 0
      }
    }
  }

  /**
   * Calculate storage size used
   */
  calculateStorageSize() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? new Blob([stored]).size : 0
    } catch {
      return 0
    }
  }

  /**
   * Export analysis history
   */
  async exportHistory() {
    try {
      const history = await this.getAnalysisHistory()
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        analyses: history.map(a => a.toObject())
      }
      
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Export error:', error)
      throw new Error('Failed to export analysis history')
    }
  }

  /**
   * Import analysis history
   */
  async importHistory(jsonData) {
    try {
      const importData = JSON.parse(jsonData)
      
      if (!importData.analyses || !Array.isArray(importData.analyses)) {
        throw new Error('Invalid import data format')
      }

      const analyses = importData.analyses.map(data => new AnalysisModel(data))
      
      // Merge with existing history
      const existingHistory = await this.getAnalysisHistory()
      const mergedHistory = [...analyses, ...existingHistory]
      
      // Remove duplicates and limit size
      const uniqueHistory = this.removeDuplicates(mergedHistory).slice(0, this.maxItems)
      
      // Save merged history
      localStorage.setItem(this.storageKey, JSON.stringify(uniqueHistory.map(a => a.toObject())))
      
      return uniqueHistory.length
    } catch (error) {
      console.error('Import error:', error)
      throw new Error('Failed to import analysis history')
    }
  }

  /**
   * Remove duplicate analyses
   */
  removeDuplicates(analyses) {
    const seen = new Set()
    return analyses.filter(analysis => {
      if (seen.has(analysis.id)) {
        return false
      }
      seen.add(analysis.id)
      return true
    })
  }
}
