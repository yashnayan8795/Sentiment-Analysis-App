import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter that allows 100 requests per hour
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true, // Enable analytics
})

export default ratelimit

export async function rateLimit(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const result = await ratelimit.limit(ip)
  
  return result
} 