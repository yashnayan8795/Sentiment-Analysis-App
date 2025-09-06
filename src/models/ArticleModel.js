/**
 * Article Model - Handles article data structure and validation
 */
export class ArticleModel {
  constructor(data = {}) {
    this.id = data.id || this.generateId()
    this.url = data.url || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.content = data.content || ''
    this.timestamp = data.timestamp || new Date().toISOString()
    this.isValid = this.validate()
  }

  /**
   * Validate article data
   */
  validate() {
    if (!this.url || !this.isValidUrl(this.url)) {
      return false
    }
    if (!this.title || this.title.trim().length === 0) {
      return false
    }
    return true
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
   * Generate unique ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * Convert to plain object
   */
  toObject() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      description: this.description,
      content: this.content,
      timestamp: this.timestamp
    }
  }

  /**
   * Update article data
   */
  update(data) {
    Object.assign(this, data)
    this.isValid = this.validate()
    return this
  }
}
