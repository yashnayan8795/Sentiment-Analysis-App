import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Simple in-memory rate limiting for development
const requestTracker = new Map<string, { count: number; timestamp: number }>()

// Create Redis instance only if environment variables are available
let ratelimit: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'),
      analytics: true,
    })
  }
} catch (error) {
  console.warn('Redis connection failed, using in-memory rate limiting')
}

export default ratelimit

export async function rateLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Use Redis rate limiting if available
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(ip)
      return result
    } catch (error) {
      console.warn('Redis rate limiting failed, falling back to memory')
    }
  }
  
  // Fallback to simple in-memory rate limiting
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 100
  
  const existing = requestTracker.get(ip)
  
  if (!existing || now - existing.timestamp > windowMs) {
    // Reset or create new tracking
    requestTracker.set(ip, { count: 1, timestamp: now })
    return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs }
  }
  
  if (existing.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0, reset: existing.timestamp + windowMs }
  }
  
  // Increment count
  existing.count++
  return { success: true, limit: maxRequests, remaining: maxRequests - existing.count, reset: existing.timestamp + windowMs }
} 