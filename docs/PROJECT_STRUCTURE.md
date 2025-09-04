# Sentiment Analysis App - Project Structure

## Overview
This is a full-stack sentiment analysis application built with Next.js frontend and FastAPI backend.

## Directory Structure

```
Sentiment-Analysis-App/
├── app/                     # Next.js App Router
│   ├── about/              # About page
│   ├── api/                # API routes (proxy to FastAPI)
│   ├── contact/            # Contact page
│   ├── dashboard/          # Dashboard page
│   ├── project-details/    # Project details page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Home page
├── backend/                # FastAPI backend
│   ├── main.py            # Main FastAPI application
│   └── run_stable.py      # Stable server runner (no auto-reload)
├── components/             # React components
│   ├── ui/                # Shadcn/ui components
│   ├── nav-bar.tsx        # Navigation bar
│   ├── power-bi-dashboard.tsx  # Power BI integration
│   ├── recent-analyses.tsx     # Recent analysis display
│   ├── results-display.tsx     # Results visualization
│   ├── sentiment-analyzer.tsx  # Main analyzer component
│   ├── sentiment-breakdown.tsx # Sentiment breakdown chart
│   ├── sentiment-meter.tsx     # Sentiment meter component
│   └── theme-provider.tsx      # Theme context provider
├── docs/                   # Documentation and notebooks
│   ├── notebooks/         # Jupyter notebooks
│   │   └── analysis.ipynb # Analysis notebook
│   └── PROJECT_STRUCTURE.md # This file
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection hook
│   └── use-toast.ts       # Toast notifications hook
├── lib/                   # Utility libraries
│   ├── db.ts              # Database utilities
│   ├── rate-limit.ts      # Rate limiting utilities
│   └── utils.ts           # General utilities
├── public/                # Static assets
│   └── (placeholder images)
├── .env.local             # Environment variables
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── components.json       # Shadcn/ui configuration
├── jest.config.ts        # Jest testing configuration
├── next.config.mjs       # Next.js configuration
├── package.json          # Node.js dependencies
├── postcss.config.mjs    # PostCSS configuration
├── requirements.txt      # Python dependencies
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Key Features

### Frontend (Next.js)
- **Framework**: Next.js 15.2.4 with App Router
- **UI**: Tailwind CSS + Shadcn/ui components
- **Features**: 
  - Dark/light theme switching
  - Responsive design
  - Interactive charts (Recharts)
  - Smooth animations (Framer Motion)
  - Rate limiting with Redis fallback

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **AI Models**: 
  - DistilBERT for sentiment analysis
  - T5-small for text summarization
- **Features**:
  - Web scraping (BeautifulSoup + aiohttp)
  - MongoDB integration with graceful fallbacks
  - Comprehensive error handling
  - CORS enabled for frontend communication

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (optional - app works without it)
- Redis (optional - falls back to in-memory)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Install Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   python run_stable.py
   ```
   Backend will be available at: http://localhost:8000

2. **Start Frontend**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   Frontend will be available at: http://localhost:3000

## Architecture

### Data Flow
1. User submits URL via frontend
2. Frontend sends request to `/api/analyze`
3. Next.js API route forwards to FastAPI backend
4. Backend scrapes URL content
5. AI models process content for sentiment & summary
6. Results stored in MongoDB (optional)
7. Response sent back through the chain
8. Frontend displays interactive results

### Error Handling
- Graceful degradation when external services fail
- Comprehensive validation at all levels
- User-friendly error messages
- Fallback mechanisms for Redis and MongoDB

## Development Notes

- **Hot Reload**: Frontend supports hot reload; backend uses stable mode
- **Type Safety**: Full TypeScript coverage on frontend
- **Testing**: Jest configured for component testing
- **AI Models**: Cached after first load for performance
- **Rate Limiting**: 100 requests per hour per IP