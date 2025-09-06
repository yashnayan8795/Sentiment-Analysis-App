/**
 * MVC Architecture Tests
 * Tests to verify the MVC structure is working correctly
 */

// Mock DOM environment
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
global.window = dom.window
global.document = dom.window.document
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

// Mock fetch
global.fetch = jest.fn()

describe('MVC Architecture Tests', () => {
  let AnalysisModel, SentimentModel, ArticleModel
  let AnalysisService, StorageService, ApiClient
  let AnalysisController, AnalysisView

  beforeAll(async () => {
    // Import modules
    const models = await import('../models/AnalysisModel.js')
    const services = await import('../services/AnalysisService.js')
    const controllers = await import('../controllers/AnalysisController.js')
    const views = await import('../views/AnalysisView.js')
    
    AnalysisModel = models.AnalysisModel
    SentimentModel = models.SentimentModel
    ArticleModel = models.ArticleModel
    AnalysisService = services.AnalysisService
    StorageService = services.StorageService
    ApiClient = services.ApiClient
    AnalysisController = controllers.AnalysisController
    AnalysisView = views.AnalysisView
  })

  describe('Model Layer', () => {
    test('ArticleModel should validate URL correctly', () => {
      const validArticle = new ArticleModel({
        url: 'https://example.com/article',
        title: 'Test Article'
      })
      
      expect(validArticle.isValid).toBe(true)
      expect(validArticle.url).toBe('https://example.com/article')
    })

    test('ArticleModel should reject invalid URL', () => {
      const invalidArticle = new ArticleModel({
        url: 'invalid-url',
        title: 'Test Article'
      })
      
      expect(invalidArticle.isValid).toBe(false)
    })

    test('SentimentModel should calculate visualization values', () => {
      const sentiment = new SentimentModel({
        sentiment: 'positive',
        score: 0.8
      })
      
      const values = sentiment.calculateVisualizationValues()
      
      expect(values.mainValue).toBeGreaterThan(50)
      expect(values.breakdown.positive).toBeGreaterThan(values.breakdown.negative)
    })

    test('AnalysisModel should combine article and sentiment', () => {
      const article = new ArticleModel({
        url: 'https://example.com/article',
        title: 'Test Article'
      })
      
      const sentiment = new SentimentModel({
        sentiment: 'positive',
        score: 0.8
      })
      
      const analysis = new AnalysisModel({
        article,
        sentiment,
        summary: 'Test summary'
      })
      
      expect(analysis.isValid).toBe(true)
      expect(analysis.article).toBe(article)
      expect(analysis.sentiment).toBe(sentiment)
    })
  })

  describe('Service Layer', () => {
    test('StorageService should save and retrieve analyses', async () => {
      const storageService = new StorageService()
      
      const analysis = new AnalysisModel({
        article: new ArticleModel({
          url: 'https://example.com/test',
          title: 'Test Article'
        }),
        sentiment: new SentimentModel({
          sentiment: 'positive',
          score: 0.8
        }),
        summary: 'Test summary'
      })
      
      await storageService.saveAnalysis(analysis)
      const retrieved = await storageService.getAnalysisHistory()
      
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].article.url).toBe('https://example.com/test')
    })

    test('ApiClient should handle requests correctly', async () => {
      const apiClient = new ApiClient()
      
      // Mock successful response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: 'https://example.com/test',
          heading: 'Test Article',
          sentiment: 'positive',
          score: 0.8
        })
      })
      
      const result = await apiClient.analyze('https://example.com/test')
      
      expect(fetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/test' })
      })
      expect(result.url).toBe('https://example.com/test')
    })
  })

  describe('Controller Layer', () => {
    test('AnalysisController should initialize correctly', () => {
      const controller = new AnalysisController()
      
      expect(controller).toBeDefined()
      expect(controller.getCurrentAnalysis()).toBeNull()
      expect(controller.getAnalysisHistory()).toEqual([])
      expect(controller.isLoading()).toBe(false)
    })

    test('AnalysisController should handle events', () => {
      const controller = new AnalysisController()
      const mockCallback = jest.fn()
      
      controller.on('testEvent', mockCallback)
      controller.emit('testEvent', 'test data')
      
      expect(mockCallback).toHaveBeenCalledWith('test data')
    })
  })

  describe('View Layer', () => {
    test('AnalysisView should render correctly', () => {
      const view = new AnalysisView('app')
      
      expect(document.getElementById('app')).toBeTruthy()
      expect(document.getElementById('analysis-form')).toBeTruthy()
      expect(document.getElementById('url-input')).toBeTruthy()
    })

    test('AnalysisView should handle form submission', () => {
      const view = new AnalysisView('app')
      const form = document.getElementById('analysis-form')
      const urlInput = document.getElementById('url-input')
      
      // Mock controller
      view.controller = {
        analyzeArticle: jest.fn().mockResolvedValue({})
      }
      
      urlInput.value = 'https://example.com/test'
      form.dispatchEvent(new Event('submit'))
      
      expect(view.controller.analyzeArticle).toHaveBeenCalledWith('https://example.com/test')
    })
  })

  describe('MVC Integration', () => {
    test('Complete MVC flow should work', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          url: 'https://example.com/test',
          heading: 'Test Article',
          overall_sentiment: 'positive',
          score: 0.8,
          summary_with_sentiment: 'Test summary',
          timestamp: new Date().toISOString()
        })
      })
      
      const controller = new AnalysisController()
      
      // Test analysis flow
      const analysis = await controller.analyzeArticle('https://example.com/test')
      
      expect(analysis).toBeDefined()
      expect(analysis.article.url).toBe('https://example.com/test')
      expect(analysis.sentiment.sentiment).toBe('positive')
    })
  })

  describe('Error Handling', () => {
    test('Should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
      
      const controller = new AnalysisController()
      
      await expect(controller.analyzeArticle('https://example.com/test'))
        .rejects.toThrow()
    })

    test('Should handle invalid URLs', async () => {
      const controller = new AnalysisController()
      
      await expect(controller.analyzeArticle('invalid-url'))
        .rejects.toThrow('Please enter a valid URL')
    })
  })
})

describe('MVC Architecture Validation', () => {
  test('All MVC layers should be properly separated', () => {
    // This test ensures that the MVC architecture is properly implemented
    // by checking that each layer has its specific responsibilities
    
    // Models should handle data and validation
    expect(typeof AnalysisModel).toBe('function')
    expect(typeof SentimentModel).toBe('function')
    expect(typeof ArticleModel).toBe('function')
    
    // Services should handle business logic
    expect(typeof AnalysisService).toBe('function')
    expect(typeof StorageService).toBe('function')
    expect(typeof ApiClient).toBe('function')
    
    // Controllers should coordinate between models and services
    expect(typeof AnalysisController).toBe('function')
    
    // Views should handle presentation
    expect(typeof AnalysisView).toBe('function')
  })

  test('Dependency injection should work correctly', () => {
    const apiClient = new ApiClient()
    const storageService = new StorageService()
    const analysisService = new AnalysisService(apiClient, storageService)
    const controller = new AnalysisController()
    
    // Services should be properly injected
    expect(analysisService.apiClient).toBe(apiClient)
    expect(analysisService.storageService).toBe(storageService)
  })
})
