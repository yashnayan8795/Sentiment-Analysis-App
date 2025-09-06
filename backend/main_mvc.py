"""
Main FastAPI Application with MVC Architecture
"""
import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv

from .models.analysis_model import URLInputModel, TextInputModel
from .services.analysis_service import AnalysisService, WebScrapingService, AIService
from .repositories.analysis_repository import AnalysisRepository
from .controllers.analysis_controller import AnalysisController

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Sentiment Analysis API (MVC)",
    description="AI-powered news article sentiment analysis with MVC architecture",
    version="2.0.0"
)

# Enable CORS for local development and production
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:3001", 
    "http://127.0.0.1:3001"
]

# Add production origins if environment variables are set
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for dependency injection
analysis_controller: AnalysisController = None
collection: Collection = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global analysis_controller, collection
    
    try:
        logger.info("🚀 Starting Sentiment Analysis API (MVC)...")
        
        # Initialize MongoDB connection
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        if mongo_uri == "mongodb://localhost:27017":
            logger.warning("⚠️  Using default MongoDB URI. Set MONGODB_URI environment variable for production.")
        
        try:
            client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                maxPoolSize=1,
                retryWrites=True
            )
            db = client["sentiment-analysis"]
            collection = db["scraped_articles"]
            client.admin.command('ping')
            logger.info("✅ Successfully connected to MongoDB")
        except Exception as e:
            logger.warning(f"⚠️  MongoDB connection failed: {e}")
            logger.info("📝 Application will continue without database persistence")
            collection = None
        
        # Initialize services
        web_scraping_service = WebScrapingService()
        ai_service = AIService()
        ai_service.load_models()  # Load AI models
        
        analysis_service = AnalysisService(web_scraping_service, ai_service)
        analysis_repository = AnalysisRepository(collection)
        
        # Initialize controller
        analysis_controller = AnalysisController(analysis_service, analysis_repository)
        
        logger.info("✅ All services initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Sentiment Analysis API...")

# Dependency to get controller
def get_controller() -> AnalysisController:
    if analysis_controller is None:
        raise HTTPException(status_code=503, detail="Service not available")
    return analysis_controller

# Health check endpoint
@app.get("/")
def read_root():
    return {"message": "Sentiment Analysis API (MVC) is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    controller = get_controller()
    return await controller.health_check()

@app.get("/test-simple/")
def test_simple():
    """Simple test endpoint"""
    return {
        "status": "success",
        "message": "API is working correctly!",
        "architecture": "MVC",
        "timestamp": datetime.utcnow().isoformat()
    }

# Analysis endpoints
@app.post("/analyze/")
async def analyze_article(url_input: URLInputModel, controller: AnalysisController = Depends(get_controller)):
    """Analyze article sentiment from URL"""
    return await controller.analyze_article(url_input)

@app.post("/analyze-text/")
async def analyze_text(text_input: TextInputModel, controller: AnalysisController = Depends(get_controller)):
    """Analyze sentiment of provided text"""
    return await controller.analyze_text(text_input)

@app.get("/history/")
async def get_history(controller: AnalysisController = Depends(get_controller)):
    """Get analysis history"""
    return await controller.get_analysis_history()

@app.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str, controller: AnalysisController = Depends(get_controller)):
    """Get specific analysis by ID"""
    return await controller.get_analysis_by_id(analysis_id)

@app.get("/raw-sentiment/")
async def get_raw_sentiment(url: str, controller: AnalysisController = Depends(get_controller)):
    """Get raw sentiment data for URL"""
    return await controller.get_raw_sentiment(url)

@app.delete("/history/")
async def clear_history(controller: AnalysisController = Depends(get_controller)):
    """Clear analysis history"""
    return await controller.clear_history()

@app.get("/stats/")
async def get_stats(controller: AnalysisController = Depends(get_controller)):
    """Get analysis statistics"""
    return await controller.get_analysis_stats()

# Sample data endpoint for testing
@app.post("/add-sample-data/")
async def add_sample_data(controller: AnalysisController = Depends(get_controller)):
    """Add sample analysis data for testing"""
    from datetime import datetime, timedelta
    from ..models.analysis_model import AnalysisModel, ArticleModel, SentimentModel, SentimentType
    
    sample_analyses = [
        AnalysisModel(
            article=ArticleModel(
                url="https://example.com/positive-news",
                title="Technology Stocks Surge on AI Breakthrough",
                description="Major technology companies reported significant gains following AI innovations"
            ),
            sentiment=SentimentModel(
                sentiment=SentimentType.POSITIVE,
                score=0.89,
                confidence=0.89,
                breakdown={"positive": 0.89, "neutral": 0.07, "negative": 0.04}
            ),
            summary="Technology companies show strong performance with AI innovations driving market growth"
        ),
        AnalysisModel(
            article=ArticleModel(
                url="https://example.com/neutral-news",
                title="Market Analysis: Mixed Signals Continue",
                description="Financial markets show varied performance across different sectors"
            ),
            sentiment=SentimentModel(
                sentiment=SentimentType.NEUTRAL,
                score=0.52,
                confidence=0.52,
                breakdown={"positive": 0.3, "neutral": 0.52, "negative": 0.18}
            ),
            summary="Market conditions remain uncertain with mixed signals across sectors"
        ),
        AnalysisModel(
            article=ArticleModel(
                url="https://example.com/negative-news",
                title="Concerns Rise Over Economic Uncertainty",
                description="Analysts express worries about potential economic challenges ahead"
            ),
            sentiment=SentimentModel(
                sentiment=SentimentType.NEGATIVE,
                score=0.78,
                confidence=0.78,
                breakdown={"positive": 0.09, "neutral": 0.13, "negative": 0.78}
            ),
            summary="Economic uncertainty continues to concern analysts and market participants"
        )
    ]
    
    # Save sample data
    saved_count = 0
    for analysis in sample_analyses:
        try:
            await controller.analysis_repository.save_analysis(analysis)
            saved_count += 1
        except Exception as e:
            logger.warning(f"Failed to save sample analysis: {e}")
    
    return {
        "message": f"Added {saved_count} sample analyses",
        "total_added": saved_count
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
