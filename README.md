# News Sentiment Analyzer

A Next.js application that analyzes the sentiment of news articles using AI.

## Features

- URL-based news article analysis
- Sentiment visualization with charts
- Historical analysis tracking
- Dark/light theme support
- Responsive design

## Tech Stack

- Frontend: Next.js 13+, React 18+, TypeScript
- Styling: Tailwind CSS
- UI Components: Radix UI
- Charts: Recharts
- Backend Integration: FastAPI
- Database: MongoDB
- Caching: Redis

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm
- MongoDB
- Redis (for rate limiting)
- FastAPI backend running

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/news-sentiment-analyzer.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy .env.example to .env.local and update variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
pnpm dev
```

### Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: FastAPI backend URL
- `MONGODB_URI`: MongoDB connection string
- `API_RATE_LIMIT`: Requests per hour limit
- `API_KEY`: API authentication key

## API Documentation

### POST /api/analyze
Analyzes a news article URL for sentiment.

Request:
```json
{
  "url": "https://example.com/article"
}
```

Response:
```json
{
  "heading": "Article Title",
  "meta_description": "Description",
  "summary_with_sentiment": "Summary [Sentiment: Positive]",
  "overall_sentiment": "positive"
}
```

### GET /api/history
Retrieves analysis history.

Response:
```json
{
  "articles": [
    {
      "id": "uuid",
      "url": "https://example.com/article",
      "title": "Article Title",
      "sentiment": "positive",
      "timestamp": "2024-03-31T12:00:00Z"
    }
  ]
}
```

## Testing

Run tests:
```bash
pnpm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 