# 📰 SentiNews - Intelligent News Sentiment Analyzer

*Transform any news article into actionable sentiment insights with the power of AI*

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


## 🏗️ MVC Architecture Overview

This project has been refactored to follow the **Model-View-Controller (MVC)** architectural pattern, providing clear separation of concerns, improved maintainability, and better testability.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)           │  Backend (FastAPI)              │
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐    │
│  │        VIEWS            │  │  │     CONTROLLERS         │    │
│  │  - AnalysisView.js      │  │  │  - AnalysisController   │    │
│  │  - DashboardView.js     │  │  │  - DashboardController  │    │
│  │  - HistoryView.js       │  │  │  - StatsController      │    │
│  └─────────────────────────┘  │  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                        BUSINESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐    │
│  │       SERVICES          │  │  │        MODELS           │    │
│  │  - AnalysisService      │  │  │  - AnalysisModel        │    │
│  │  - StorageService       │  │  │  - ArticleModel         │    │
│  │  - ApiClient            │  │  │  - SentimentModel       │    │
│  │  - WebScrapingService   │  │  │  - URLInputModel        │    │
│  │  - AIService            │  │  │  - TextInputModel       │    │
│  └─────────────────────────┘  │  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  │  ┌─────────────────────────┐    │
│  │     REPOSITORIES        │  │  │      DATABASES          │    │
│  │  - AnalysisRepository   │  │  │  - MongoDB              │    │
│  │  - StorageRepository    │  │  │  - Redis (Rate Limiting)│    │
│  └─────────────────────────┘  │  │  - Local Storage        │    │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
Sentiment-Analysis-App/
├── src/                          # Frontend MVC Structure
│   ├── models/                   # Data Models
│   │   ├── ArticleModel.js       # Article data structure
│   │   ├── SentimentModel.js     # Sentiment analysis data
│   │   └── AnalysisModel.js      # Combined analysis model
│   ├── services/                 # Business Logic Services
│   │   ├── AnalysisService.js    # Main analysis business logic
│   │   ├── StorageService.js     # Data persistence service
│   │   └── ApiClient.js          # API communication service
│   ├── controllers/              # Controllers
│   │   └── AnalysisController.js # Main application controller
│   ├── views/                    # View Components
│   │   └── AnalysisView.js       # Main analysis interface
│   ├── styles/                   # Styling
│   │   └── mvc-styles.css        # MVC-specific styles
│   └── app.js                    # Application entry point
├── backend/                      # Backend MVC Structure
│   ├── models/                   # Data Models
│   │   └── analysis_model.py     # Pydantic models
│   ├── services/                 # Business Logic Services
│   │   ├── analysis_service.py   # Core analysis logic
│   │   ├── web_scraping_service.py # Web scraping logic
│   │   └── ai_service.py         # AI model operations
│   ├── controllers/              # Controllers
│   │   └── analysis_controller.py # HTTP request handling
│   ├── repositories/             # Data Access Layer
│   │   └── analysis_repository.py # Database operations
│   └── main_mvc.py              # FastAPI application
├── app/                         # Next.js App Router
│   ├── api/                     # API Routes (Controllers)
│   │   ├── analyze/route.js     # Analysis endpoint
│   │   └── history/route.js     # History endpoint
│   └── page.jsx                 # Main page component
└── components/                  # Legacy UI Components (for reference)
```

## 🔧 MVC Components Breakdown

### **Models (Data Layer)**

#### Frontend Models
- **`ArticleModel.js`**: Handles article data structure and validation
- **`SentimentModel.js`**: Manages sentiment analysis data and calculations
- **`AnalysisModel.js`**: Combines article and sentiment data

#### Backend Models
- **`analysis_model.py`**: Pydantic models for data validation and serialization

### **Views (Presentation Layer)**

#### Frontend Views
- **`AnalysisView.js`**: Main analysis interface with MVC pattern
- **`DashboardView.js`**: Dashboard visualization (planned)
- **`HistoryView.js`**: Analysis history display (planned)

### **Controllers (Business Logic Layer)**

#### Frontend Controllers
- **`AnalysisController.js`**: Manages application state and coordinates services

#### Backend Controllers
- **`analysis_controller.py`**: Handles HTTP requests and coordinates services

### **Services (Business Logic)**

#### Frontend Services
- **`AnalysisService.js`**: Main business logic for analysis operations
- **`StorageService.js`**: Local storage management
- **`ApiClient.js`**: Backend API communication

#### Backend Services
- **`analysis_service.py`**: Core analysis business logic
- **`web_scraping_service.py`**: Web scraping and content extraction
- **`ai_service.py`**: AI model operations

### **Repositories (Data Access)**

#### Backend Repositories
- **`analysis_repository.py`**: Database operations with MongoDB and fallback

## 🚀 Key MVC Benefits

### **1. Separation of Concerns**
- **Models**: Handle data structure and business rules
- **Views**: Manage user interface and presentation
- **Controllers**: Coordinate between models and views

### **2. Improved Maintainability**
- Clear code organization
- Easy to locate and modify specific functionality
- Reduced coupling between components

### **3. Better Testability**
- Each layer can be tested independently
- Mock dependencies easily
- Unit tests for models, integration tests for controllers

### **4. Scalability**
- Easy to add new features
- Modular architecture supports team development
- Clear interfaces between layers

### **5. Code Reusability**
- Models can be reused across different views
- Services can be shared between controllers
- Clear abstractions enable component reuse

## 🛠️ Installation & Setup

### **1. Install Dependencies**

```bash
# Frontend dependencies
npm install

# Backend dependencies
pip install -r requirements.txt
```

### **2. Environment Configuration**

```bash
# Copy environment template
npm run setup
# or manually: cp .env.example .env.local
```

The `.env.local` file will be created with default local development settings. You can modify it if needed:
```env
# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Database Configuration (Optional - app works without it)
MONGODB_URI=mongodb://localhost:27017

# Redis Configuration (Optional - falls back to in-memory)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### **3. Run the Application**

**Option 1: MVC Architecture (Recommended)**
```bash
# Terminal 1 - Backend (MVC)
npm run backend

# Terminal 2 - Frontend
npm run dev
```

**Option 2: Legacy Architecture**
```bash
# Terminal 1 - Backend (Legacy)
npm run backend:legacy

# Terminal 2 - Frontend
npm run dev
```

## 📊 API Endpoints (MVC)

### **Analysis Endpoints**
- `POST /api/analyze` - Analyze article from URL
- `POST /api/analyze-text` - Analyze provided text
- `GET /api/history` - Get analysis history
- `GET /api/analysis/{id}` - Get specific analysis
- `GET /api/raw-sentiment?url={url}` - Get raw sentiment data

### **Management Endpoints**
- `DELETE /api/history` - Clear analysis history
- `GET /api/stats` - Get analysis statistics
- `GET /api/health` - Health check

## 🧪 Testing MVC Architecture

### **Frontend Testing**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### **Backend Testing**
```bash
# Run Python tests
pytest backend/tests/

# Run with coverage
pytest --cov=backend backend/tests/
```

### **MVC Architecture Test**
```bash
# Test MVC structure
npm run mvc:test
```

## 📈 Performance Benefits

### **Frontend Performance**
- **Lazy Loading**: Views load only when needed
- **State Management**: Centralized controller state
- **Memory Efficiency**: Proper cleanup and disposal

### **Backend Performance**
- **Service Caching**: AI models cached after first load
- **Database Optimization**: Efficient queries with fallbacks
- **Error Recovery**: Graceful degradation

## 🛡️ Security & Error Handling

### **MVC Security Features**
- **Input Validation**: Models validate all inputs
- **Error Boundaries**: Controllers handle errors gracefully
- **Rate Limiting**: Service-level rate limiting
- **Data Sanitization**: Repository-level data cleaning

### **Error Handling Strategy**
1. **Models**: Validate data and throw validation errors
2. **Services**: Handle business logic errors
3. **Controllers**: Transform errors to HTTP responses
4. **Views**: Display user-friendly error messages


## 📚 Learning Resources


### **Technology Stack**
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)

## 🤝 Contributing

### **MVC Development Guidelines**
1. **Models**: Keep business logic in models
2. **Views**: Keep presentation logic in views
3. **Controllers**: Keep coordination logic in controllers
4. **Services**: Keep reusable business logic in services
5. **Repositories**: Keep data access logic in repositories

### **Code Organization**
- Follow the established MVC structure
- Use dependency injection for services
- Implement proper error handling
- Write comprehensive tests
- Document public APIs

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](#api-documentation)
2. Search [existing issues](https://github.com/yourusername/sentiment-analysis-app/issues)
3. Create a [new issue](https://github.com/yourusername/sentiment-analysis-app/issues/new)

## Author
YASH NAYAN

---
