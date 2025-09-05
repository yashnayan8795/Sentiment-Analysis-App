# Sentiment Analysis App

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Latest-red)](https://redis.io/)

A comprehensive full-stack web application that analyzes the sentiment of news articles using AI-powered natural language processing. Built with modern technologies for production-ready performance and scalability.

## 🌟 Features

### Core Functionality
- **URL-based Analysis**: Analyze any news article by simply pasting its URL
- **AI-Powered Processing**: Uses DistilBERT and T5-small models for accurate sentiment analysis and summarization
- **Real-time Visualization**: Interactive charts and meters showing sentiment breakdown
- **Historical Tracking**: Store and view analysis history with MongoDB persistence
- **Rate Limiting**: Built-in protection against API abuse (100 requests/hour/IP)

### User Experience
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Dashboard**: Comprehensive analytics and insights visualization
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Loading States**: Smooth loading indicators and progress feedback

### Technical Features
- **TypeScript to JavaScript**: Fully converted for broader compatibility
- **Production Ready**: Comprehensive error handling and resilient architecture
- **Modular Components**: 45+ reusable UI components with Radix UI
- **Performance Optimized**: Built-in caching and optimization strategies

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │────│   (FastAPI)     │────│   Services      │
│                 │    │                 │    │                 │
│ • React 19      │    │ • AI Models     │    │ • MongoDB       │
│ • Tailwind CSS  │    │ • Web Scraping  │    │ • Redis         │
│ • Radix UI      │    │ • Rate Limiting │    │ • Upstash       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Structure
```
app/
├── api/                    # Backend-for-Frontend API routes
│   ├── analyze/            # Sentiment analysis endpoint
│   ├── history/            # Analysis history management
│   ├── powerbi-token/      # PowerBI integration
│   └── raw-sentiment/      # Raw sentiment data
├── (pages)/               # Application pages
components/
├── ui/                    # Reusable UI components (45+ components)
├── sentiment-analyzer.jsx # Main analysis interface
├── results-display.jsx    # Analysis results presentation
├── sentiment-meter.jsx    # Circular sentiment gauge
├── sentiment-breakdown.jsx# Sentiment distribution chart
└── recent-analyses.jsx    # Historical analysis viewer
lib/
├── rate-limit.js          # Redis rate limiting with fallback
├── db.js                  # MongoDB connection management
└── utils.js               # Utility functions and helpers
```

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: JavaScript (converted from TypeScript)
- **UI Library**: React 19 with modern hooks
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Components**: Radix UI primitives for accessibility
- **Charts**: Recharts 2.15.0 for data visualization
- **Animations**: Framer Motion 12.6.2
- **Theme**: next-themes for dark/light mode
- **Forms**: React Hook Form with Zod validation
- **State**: Local React state with custom hooks

### Backend
- **API Framework**: FastAPI with async support
- **AI/ML**: Hugging Face Transformers (DistilBERT + T5-small)
- **Web Scraping**: BeautifulSoup4 + aiohttp
- **Database**: MongoDB with connection pooling
- **Caching**: Redis via Upstash for rate limiting
- **Environment**: Python 3.8+ with uvicorn server

### Infrastructure
- **Rate Limiting**: Upstash Redis with in-memory fallback
- **Deployment**: Vercel-ready with environment configuration
- **Testing**: Jest with React Testing Library
- **Build Tools**: Next.js with optimized production builds
- **Package Manager**: pnpm for efficient dependency management

## 📋 Prerequisites

- **Node.js**: 16.0.0 or higher
- **pnpm**: Latest version (recommended over npm/yarn)
- **Python**: 3.8+ for backend services
- **MongoDB**: Local instance or cloud service (MongoDB Atlas)
- **Redis**: For rate limiting (Upstash recommended)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/sentiment-analysis-app.git
cd sentiment-analysis-app
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# API Configuration
API_RATE_LIMIT=100
API_KEY=your_api_key

# PowerBI Integration (Optional)
POWERBI_CLIENT_ID=your_powerbi_client_id
POWERBI_CLIENT_SECRET=your_powerbi_client_secret
POWERBI_TENANT_ID=your_tenant_id
```

### 4. Start Development Servers

**Terminal 1 - Backend Server:**
```bash
python backend/run_stable.py
```

**Terminal 2 - Frontend Server:**
```bash
pnpm dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 API Documentation

### Authentication
All API requests are rate-limited to 100 requests per hour per IP address.

### Endpoints

#### `POST /api/analyze`
Analyzes a news article URL for sentiment.

**Request:**
```json
{
  "url": "https://example.com/news-article"
}
```

**Response:**
```json
{
  "heading": "Breaking News: Market Analysis",
  "meta_description": "Analysis of current market trends",
  "url": "https://example.com/news-article",
  "summary_with_sentiment": "The market shows positive trends [Sentiment: Positive]",
  "overall_sentiment": "positive",
  "score": 0.85,
  "timestamp": "2024-03-31T12:00:00Z"
}
```

**Error Responses:**
- `400`: Invalid URL or malformed request
- `429`: Rate limit exceeded
- `500`: Server error or processing failure

#### `GET /api/history`
Retrieves recent analysis history.

**Response:**
```json
{
  "analyses": [
    {
      "id": "uuid-string",
      "url": "https://example.com/article",
      "title": "Article Title",
      "sentiment": "positive",
      "score": 0.85,
      "timestamp": "2024-03-31T12:00:00Z"
    }
  ],
  "total": 25,
  "page": 1
}
```

#### `GET /api/raw-sentiment`
Retrieves raw sentiment data for an analyzed URL.

**Query Parameters:**
- `url`: The article URL to get raw data for

**Response:**
```json
{
  "sentiment": "positive",
  "score": 0.85,
  "confidence": 0.92,
  "raw_data": {
    "positive": 0.85,
    "neutral": 0.10,
    "negative": 0.05
  }
}
```

#### `GET /api/powerbi-token`
Generates PowerBI embed token (requires Azure AD configuration).

**Response:**
```json
{
  "token": "embed_token_string",
  "expires": "2024-03-31T13:00:00Z"
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure
```
__tests__/
└── components/
    ├── sentiment-analyzer.test.jsx
    ├── results-display.test.jsx
    └── sentiment-meter.test.jsx
```

## 🏭 Production Deployment

### Build for Production
```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

### Deployment Platforms

**Vercel (Recommended):**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

**Self-hosted:**
1. Build the application: `pnpm build`
2. Start with PM2: `pm2 start npm --name "sentiment-app" -- start`
3. Configure reverse proxy (nginx/apache)

### Environment Variables for Production
```env
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
MONGODB_URI=mongodb+srv://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## 📊 Performance & Monitoring

### Built-in Features
- **Rate Limiting**: Automatic protection against abuse
- **Caching**: Redis-based response caching
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Built-in analytics

### Monitoring
- Monitor API response times via `/api/health`
- Track rate limiting via Redis dashboard
- Database performance via MongoDB Atlas

## 🛡️ Security Features

- **Rate Limiting**: 100 requests/hour per IP
- **Input Validation**: Comprehensive URL and data validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Sanitization**: Safe error message exposure

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run tests**: `pnpm test`
5. **Build the project**: `pnpm build`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for providing excellent NLP models
- **Radix UI** for accessible component primitives
- **Vercel** for the amazing Next.js framework
- **Upstash** for serverless Redis infrastructure
- **MongoDB** for flexible document storage

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](#api-documentation)
2. Search [existing issues](https://github.com/yourusername/sentiment-analysis-app/issues)
3. Create a [new issue](https://github.com/yourusername/sentiment-analysis-app/issues/new)

---

**Built with ❤️ using modern web technologies** 