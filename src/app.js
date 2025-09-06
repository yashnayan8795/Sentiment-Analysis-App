/**
 * Main MVC Application Entry Point
 */
import { AnalysisView } from './views/AnalysisView.js'

class SentimentAnalysisApp {
  constructor() {
    this.views = new Map()
    this.isInitialized = false
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Sentiment Analysis App...')
      
      // Initialize main analysis view
      this.views.set('analysis', new AnalysisView('app'))
      
      // Set up global error handling
      this.setupErrorHandling()
      
      // Set up theme handling
      this.setupThemeHandling()
      
      this.isInitialized = true
      console.log('✅ Application initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error)
      this.showFatalError(error)
    }
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      this.handleGlobalError(event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.handleGlobalError(event.reason)
    })
  }

  /**
   * Setup theme handling
   */
  setupThemeHandling() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Listen for theme changes
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') {
        document.documentElement.setAttribute('data-theme', event.newValue || 'light')
      }
    })
  }

  /**
   * Handle global errors
   */
  handleGlobalError(error) {
    // Show user-friendly error message
    const errorMessage = error.message || 'An unexpected error occurred'
    this.showError('Application Error', errorMessage)
  }

  /**
   * Show fatal error
   */
  showFatalError(error) {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = `
        <div class="fatal-error">
          <div class="error-content">
            <h1>⚠️ Application Error</h1>
            <p>Failed to initialize the application. Please refresh the page to try again.</p>
            <button onclick="window.location.reload()" class="btn-primary">Refresh Page</button>
            <details class="error-details">
              <summary>Error Details</summary>
              <pre>${error.stack || error.message}</pre>
            </details>
          </div>
        </div>
      `
    }
  }

  /**
   * Show error message
   */
  showError(title, message) {
    // Create error notification if not exists
    let notification = document.getElementById('error-notification')
    if (!notification) {
      notification = document.createElement('div')
      notification.id = 'error-notification'
      notification.className = 'error-notification'
      document.body.appendChild(notification)
    }

    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" class="btn-close">×</button>
      </div>
    `

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  /**
   * Get view by name
   */
  getView(name) {
    return this.views.get(name)
  }

  /**
   * Check if app is initialized
   */
  isReady() {
    return this.isInitialized
  }

  /**
   * Cleanup application
   */
  destroy() {
    this.views.forEach(view => {
      if (view.destroy) {
        view.destroy()
      }
    })
    this.views.clear()
    this.isInitialized = false
  }
}

// Create global app instance
window.SentimentAnalysisApp = new SentimentAnalysisApp()

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SentimentAnalysisApp.init()
  })
} else {
  window.SentimentAnalysisApp.init()
}

// Export for module usage
export default window.SentimentAnalysisApp
