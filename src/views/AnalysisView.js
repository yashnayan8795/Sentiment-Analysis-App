/**
 * Analysis View - Main analysis interface using MVC pattern
 */
import { AnalysisController } from '../controllers/AnalysisController.js'

export class AnalysisView {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.controller = new AnalysisController()
    this.isInitialized = false
    
    this.init()
  }

  /**
   * Initialize the view
   */
  async init() {
    try {
      this.render()
      this.bindEvents()
      await this.controller.initialize()
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize AnalysisView:', error)
      this.showError('Failed to initialize the application')
    }
  }

  /**
   * Render the main view
   */
  render() {
    this.container.innerHTML = `
      <div class="analysis-container">
        <div class="analysis-header">
          <h1>News Sentiment Analyzer</h1>
          <p>Enter a news article URL to analyze its sentiment using AI</p>
        </div>
        
        <div class="analysis-form-container">
          <form id="analysis-form" class="analysis-form">
            <div class="form-group">
              <label for="url-input">News Article URL</label>
              <div class="input-group">
                <input 
                  type="url" 
                  id="url-input" 
                  placeholder="https://example.com/news-article"
                  required
                />
                <button type="submit" id="analyze-btn" class="btn-primary">
                  <span class="btn-text">Analyze</span>
                  <span class="btn-loading" style="display: none;">
                    <span class="spinner"></span>
                    Analyzing...
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div id="error-container" class="error-container" style="display: none;">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <div class="error-message"></div>
          </div>
        </div>

        <div id="results-container" class="results-container" style="display: none;">
          <div class="results-header">
            <h2>Analysis Results</h2>
          </div>
          <div id="results-content" class="results-content"></div>
        </div>

        <div id="history-container" class="history-container">
          <div class="history-header">
            <h3>Recent Analyses</h3>
            <div class="history-actions">
              <button id="refresh-history" class="btn-secondary">Refresh</button>
              <button id="clear-history" class="btn-secondary">Clear</button>
            </div>
          </div>
          <div id="history-content" class="history-content">
            <div class="loading-placeholder">Loading history...</div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Form submission
    const form = document.getElementById('analysis-form')
    form.addEventListener('submit', this.handleFormSubmit.bind(this))

    // History actions
    const refreshBtn = document.getElementById('refresh-history')
    const clearBtn = document.getElementById('clear-history')
    
    refreshBtn.addEventListener('click', this.handleRefreshHistory.bind(this))
    clearBtn.addEventListener('click', this.handleClearHistory.bind(this))

    // Controller events
    this.controller.on('analysisStarted', this.handleAnalysisStarted.bind(this))
    this.controller.on('analysisCompleted', this.handleAnalysisCompleted.bind(this))
    this.controller.on('analysisError', this.handleAnalysisError.bind(this))
    this.controller.on('historyLoaded', this.handleHistoryLoaded.bind(this))
    this.controller.on('error', this.handleError.bind(this))
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault()
    
    const urlInput = document.getElementById('url-input')
    const url = urlInput.value.trim()
    
    if (!url) {
      this.showError('Please enter a news article URL to analyze')
      return
    }

    try {
      await this.controller.analyzeArticle(url)
      urlInput.value = '' // Clear input on success
    } catch (error) {
      // Error handling is done in the controller event handlers
    }
  }

  /**
   * Handle analysis started
   */
  handleAnalysisStarted() {
    this.showLoading(true)
    this.hideError()
    this.hideResults()
  }

  /**
   * Handle analysis completed
   */
  handleAnalysisCompleted(analysis) {
    this.showLoading(false)
    this.displayResults(analysis)
  }

  /**
   * Handle analysis error
   */
  handleAnalysisError(error) {
    this.showLoading(false)
    this.showError(error.message)
  }

  /**
   * Handle history loaded
   */
  handleHistoryLoaded(history) {
    this.displayHistory(history)
  }

  /**
   * Handle general error
   */
  handleError(error) {
    this.showError(error.message)
  }

  /**
   * Handle refresh history
   */
  async handleRefreshHistory() {
    try {
      await this.controller.loadAnalysisHistory()
    } catch (error) {
      this.showError('Failed to refresh history')
    }
  }

  /**
   * Handle clear history
   */
  async handleClearHistory() {
    if (confirm('Are you sure you want to clear the analysis history?')) {
      try {
        await this.controller.clearHistory()
      } catch (error) {
        this.showError('Failed to clear history')
      }
    }
  }

  /**
   * Display analysis results
   */
  displayResults(analysis) {
    const resultsContainer = document.getElementById('results-container')
    const resultsContent = document.getElementById('results-content')
    
    const visualizationData = analysis.getVisualizationData()
    const summary = analysis.getSummary()
    
    resultsContent.innerHTML = `
      <div class="result-card">
        <div class="result-header">
          <h3>${summary.title}</h3>
          <p class="result-url">${summary.url}</p>
        </div>
        
        <div class="result-summary">
          <h4>Summary</h4>
          <p>${summary.summary}</p>
        </div>
        
        <div class="result-sentiment">
          <h4>Sentiment Analysis</h4>
          <div class="sentiment-display">
            <div class="sentiment-meter">
              <div class="meter-circle">
                <div class="meter-value" style="--value: ${visualizationData.values.mainValue}%; --color: ${visualizationData.display.color}">
                  ${visualizationData.values.mainValue}%
                </div>
                <div class="meter-label">${visualizationData.display.label}</div>
              </div>
            </div>
            
            <div class="sentiment-breakdown">
              <div class="breakdown-bar">
                <div class="bar-label">Positive</div>
                <div class="bar-fill" style="width: ${visualizationData.values.breakdown.positive}%; background-color: #10b981;"></div>
                <div class="bar-value">${visualizationData.values.breakdown.positive}%</div>
              </div>
              <div class="breakdown-bar">
                <div class="bar-label">Neutral</div>
                <div class="bar-fill" style="width: ${visualizationData.values.breakdown.neutral}%; background-color: #6b7280;"></div>
                <div class="bar-value">${visualizationData.values.breakdown.neutral}%</div>
              </div>
              <div class="breakdown-bar">
                <div class="bar-label">Negative</div>
                <div class="bar-fill" style="width: ${visualizationData.values.breakdown.negative}%; background-color: #ef4444;"></div>
                <div class="bar-value">${visualizationData.values.breakdown.negative}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    resultsContainer.style.display = 'block'
  }

  /**
   * Display analysis history
   */
  displayHistory(history) {
    const historyContent = document.getElementById('history-content')
    
    if (history.length === 0) {
      historyContent.innerHTML = `
        <div class="empty-history">
          <p>No recent analyses found</p>
          <p class="empty-subtitle">Analyze some news articles to see them here</p>
        </div>
      `
      return
    }

    const historyItems = history.map(analysis => {
      const summary = analysis.getSummary()
      const display = analysis.sentiment.getDisplayProperties()
      const timestamp = analysis.getFormattedTimestamp()
      
      return `
        <div class="history-item" data-id="${analysis.id}">
          <div class="history-content">
            <h4 class="history-title">${summary.title}</h4>
            <div class="history-meta">
              <span class="history-url">${this.formatUrl(summary.url)}</span>
              <span class="history-separator">•</span>
              <span class="history-time">${timestamp}</span>
            </div>
          </div>
          <div class="history-sentiment" style="--color: ${display.color}">
            <span class="sentiment-label">${display.label}</span>
            <span class="sentiment-score">${display.percentage}%</span>
          </div>
        </div>
      `
    }).join('')

    historyContent.innerHTML = historyItems
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const analyzeBtn = document.getElementById('analyze-btn')
    const btnText = analyzeBtn.querySelector('.btn-text')
    const btnLoading = analyzeBtn.querySelector('.btn-loading')
    
    if (show) {
      btnText.style.display = 'none'
      btnLoading.style.display = 'inline-flex'
      analyzeBtn.disabled = true
    } else {
      btnText.style.display = 'inline'
      btnLoading.style.display = 'none'
      analyzeBtn.disabled = false
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorContainer = document.getElementById('error-container')
    const errorMessage = errorContainer.querySelector('.error-message')
    
    errorMessage.textContent = message
    errorContainer.style.display = 'block'
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideError()
    }, 5000)
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorContainer = document.getElementById('error-container')
    errorContainer.style.display = 'none'
  }

  /**
   * Hide results
   */
  hideResults() {
    const resultsContainer = document.getElementById('results-container')
    resultsContainer.style.display = 'none'
  }

  /**
   * Format URL for display
   */
  formatUrl(url) {
    if (!url || url === '#') return 'Unknown source'
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      return url.length > 30 ? url.substring(0, 30) + '...' : url
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.controller.destroy()
    this.container.innerHTML = ''
  }
}
