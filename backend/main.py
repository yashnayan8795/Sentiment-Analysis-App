from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
import asyncio
import aiohttp
import async_timeout
import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from bs4 import BeautifulSoup
from transformers import pipeline
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Sentiment Analysis API",
    description="AI-powered news article sentiment analysis",
    version="1.0.0"
)

# Enable CORS for frontend communication
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Sentiment Analysis API is running!"}

@app.get("/test-simple/")
def test_simple():
    """Simple test endpoint to verify API is working"""
    return {
        "status": "success",
        "message": "API is working correctly!",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/analyze-text/")
def analyze_text_direct(text_data: dict):
    """Analyze sentiment of provided text directly (no URL fetching)"""
    text = text_data.get("text", "")
    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please provide text with at least 10 characters")
    
    try:
        # Process with AI models
        content_for_analysis = text[:1000]
        summary_result = summarizer(content_for_analysis, max_length=50, min_length=30, do_sample=False)
        sentiment_result = sentiment_analyzer(content_for_analysis)
        
        # Convert to list and handle results safely
        try:
            summary_list = list(summary_result) if summary_result and hasattr(summary_result, '__iter__') and not isinstance(summary_result, str) else [summary_result] if summary_result else []
        except (TypeError, ValueError):
            summary_list = [summary_result] if summary_result else []
            
        try:
            sentiment_list = list(sentiment_result) if sentiment_result and hasattr(sentiment_result, '__iter__') and not isinstance(sentiment_result, str) else [sentiment_result] if sentiment_result else []
        except (TypeError, ValueError):
            sentiment_list = [sentiment_result] if sentiment_result else []
        
        # Extract data safely
        summary_data = summary_list[0] if summary_list else {}
        sentiment_data = sentiment_list[0] if sentiment_list else {}
        
        # Handle different return formats
        if isinstance(summary_data, dict):
            summary = summary_data.get('summary_text', 'No summary available')
        else:
            summary = str(summary_data)
            
        if isinstance(sentiment_data, dict):
            sentiment_label = sentiment_data.get('label', 'unknown')
            sentiment_score = sentiment_data.get('score', 0.0)
        else:
            sentiment_label = 'unknown'
            sentiment_score = 0.0
        
        return {
            "text": text[:200] + "..." if len(text) > 200 else text,
            "summary": summary,
            "sentiment": sentiment_label,
            "score": sentiment_score,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"AI model processing error: {e}")
        raise HTTPException(status_code=500, detail="Error processing text with AI models")

# MongoDB Connection - using environment variable for security
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
if not MONGO_URI or MONGO_URI == "mongodb://localhost:27017":
    logging.warning("⚠️  Using default MongoDB URI. Set MONGODB_URI environment variable for production.")

try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
        maxPoolSize=1,  # Limit connection pool
        retryWrites=True
    )
    db = client["sentiment-analysis"]
    collection = db["scraped_articles"]
    # Test the connection with shorter timeout
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB")
except Exception as e:
    print(f"⚠️  MongoDB connection failed: {e}")
    print("📝 Application will continue without database persistence")
    client = None
    db = None
    collection = None

# Initialize Transformers Models with error handling
print("🤖 Loading AI models...")
try:
    summarizer = pipeline("summarization", model="t5-small")
    sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    print("✅ AI models loaded successfully")
except Exception as e:
    print(f"❌ Failed to load AI models: {e}")
    raise e

# In-memory storage as fallback when MongoDB is not available
in_memory_history: List[Dict[str, Any]] = []

# Simple headers for web scraping
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

class URLInput(BaseModel):
    url: str

async def fetch_content(url: str) -> Optional[str]:
    """Fetch HTML content from URL with simple and reliable approach"""
    # Multiple fallback approaches
    approaches = [
        # Approach 1: Simple request
        {"ssl": False, "timeout": 10},
        # Approach 2: With SSL disabled
        {"ssl": True, "timeout": 15},
    ]
    
    for i, approach in enumerate(approaches):
        try:
            connector = None
            if approach["ssl"]:
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                connector = aiohttp.TCPConnector(ssl=ssl_context)
            else:
                connector = aiohttp.TCPConnector(ssl=False)
            
            async with aiohttp.ClientSession(connector=connector) as session:
                async with async_timeout.timeout(approach["timeout"]):
                    async with session.get(
                        url,
                        headers=HEADERS,
                        allow_redirects=True
                    ) as response:
                        # Check status
                        if response.status == 200:
                            content = await response.text()
                            if len(content) > 100:  # Basic validation
                                logging.info(f"Successfully fetched URL {url} with approach {i+1}")
                                return content
                        
                        logging.warning(f"Approach {i+1} failed with status {response.status} for URL {url}")
                        
        except Exception as e:
            logging.warning(f"Approach {i+1} failed for URL {url}: {e}")
            continue
    
    # If all approaches failed
    logging.error(f"All approaches failed for URL {url}")
    return None

def scrape_content(html: str) -> tuple[str, str]:
    """Extract heading and body content from HTML"""
    soup = BeautifulSoup(html, "html.parser")
    
    # Safe heading extraction
    h1_tag = soup.find("h1")
    heading = h1_tag.get_text(strip=True) if h1_tag else "No Heading"
    
    # Extract paragraphs
    paragraphs = soup.find_all("p")
    body = " ".join([p.get_text(strip=True) for p in paragraphs])
    
    return heading, body

@app.post("/analyze/")
async def analyze_article(data: URLInput):
    """Analyze sentiment of a news article from URL"""
    logging.info(f"Starting analysis for URL: {data.url}")
    
    html = await fetch_content(data.url)
    if not html:
        raise HTTPException(
            status_code=400, 
            detail=f"Unable to access the website at {data.url}. This could be due to: (1) The website blocking automated requests, (2) Network connectivity issues, (3) Invalid URL. Try a different news article URL or a simpler website like a blog post."
        )

    heading, body = scrape_content(html)
    logging.info(f"Extracted content - Heading: '{heading[:50]}...', Body length: {len(body)} chars")
    
    # Ensure we have content to analyze
    if not body.strip():
        raise HTTPException(
            status_code=400, 
            detail="No readable content found in the article. Please try a different URL with more text content."
        )
    
    # Use more content for better analysis
    content_for_analysis = body[:1000]  # Increased from 512
    
    # If content is still too short, use the heading as well
    if len(content_for_analysis.strip()) < 50:
        content_for_analysis = f"{heading}. {body}"[:1000]
    
    try:
        # Process with AI models - explicit handling for transformers
        summary_result = summarizer(content_for_analysis, max_length=50, min_length=30, do_sample=False)
        sentiment_result = sentiment_analyzer(content_for_analysis)
        
        # Convert to list if needed and validate results
        if hasattr(summary_result, '__iter__') and not isinstance(summary_result, str):
            summary_list = list(summary_result)  # type: ignore
        else:
            summary_list = [summary_result] if summary_result else []
            
        if hasattr(sentiment_result, '__iter__') and not isinstance(sentiment_result, str):
            sentiment_list = list(sentiment_result)  # type: ignore
        else:
            sentiment_list = [sentiment_result] if sentiment_result else []
        
        # Validate we have results
        if not summary_list or len(summary_list) == 0:
            raise ValueError("Summarization failed - no results returned")
        if not sentiment_list or len(sentiment_list) == 0:
            raise ValueError("Sentiment analysis failed - no results returned")
            
        # Extract data safely
        summary_data = summary_list[0]
        sentiment_data = sentiment_list[0]
        
        # Handle different return formats
        if isinstance(summary_data, dict):
            summary = summary_data.get('summary_text', str(summary_data))
        else:
            summary = str(summary_data)
            
        if isinstance(sentiment_data, dict):
            sentiment_label = sentiment_data.get('label', 'unknown')
            sentiment_score = sentiment_data.get('score', 0.0)
        else:
            sentiment_label = 'unknown'
            sentiment_score = 0.0
        
    except Exception as e:
        logging.error(f"AI model processing error: {e}")
        raise HTTPException(status_code=500, detail="Error processing article with AI models")

    result = {
        "url": data.url,
        "heading": heading,
        "summary": summary,
        "sentiment": sentiment_label,
        "score": sentiment_score,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Store in MongoDB (with error handling) or in-memory as fallback
    if collection is not None:
        try:
            result_copy = result.copy()
            collection.insert_one(result_copy)
            logging.info(f"Stored analysis for URL: {data.url}")
        except Exception as e:
            logging.warning(f"Database storage failed (continuing without persistence): {e}")
    else:
        # Store in memory as fallback
        try:
            result_copy = result.copy()
            in_memory_history.insert(0, result_copy)  # Insert at beginning for newest first
            # Keep only last 50 analyses in memory
            if len(in_memory_history) > 50:
                in_memory_history.pop()
            logging.info(f"Stored analysis in memory for URL: {data.url}")
        except Exception as e:
            logging.warning(f"In-memory storage failed: {e}")
    
    return result

@app.get("/history/")
async def get_history():
    """Retrieve analysis history from database or in-memory storage"""
    if collection is not None:
        try:
            # Get last 50 analyses from MongoDB, sorted by timestamp (newest first)
            articles = list(collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
            return {"articles": articles, "source": "database"}
        except Exception as e:
            logging.warning(f"Database query failed: {e}")
            # Fall back to in-memory storage
            return {"articles": in_memory_history[:50], "source": "memory", "message": "Database temporarily unavailable, showing in-memory history"}
    else:
        # Use in-memory storage when database is not available
        return {
            "articles": in_memory_history[:50], 
            "source": "memory",
            "message": f"Database not available. Showing {len(in_memory_history)} analyses from current session."
        }

@app.post("/add-sample-data/")
def add_sample_data():
    """Add sample analysis data for testing history functionality"""
    sample_analyses = [
        {
            "url": "https://example.com/positive-news",
            "heading": "Technology Stocks Surge on AI Breakthrough",
            "summary": "Major technology companies reported significant gains following AI innovations",
            "sentiment": "POSITIVE",
            "score": 0.89,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "url": "https://example.com/neutral-news",
            "heading": "Market Analysis: Mixed Signals Continue",
            "summary": "Financial markets show varied performance across different sectors",
            "sentiment": "NEUTRAL",
            "score": 0.52,
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "url": "https://example.com/negative-news",
            "heading": "Concerns Rise Over Economic Uncertainty",
            "summary": "Analysts express worries about potential economic challenges ahead",
            "sentiment": "NEGATIVE",
            "score": 0.78,
            "timestamp": datetime.utcnow().isoformat()
        }
    ]
    
    # Add to in-memory storage
    for analysis in sample_analyses:
        in_memory_history.insert(0, analysis)
    
    # Keep only last 50 analyses
    if len(in_memory_history) > 50:
        in_memory_history[:] = in_memory_history[:50]
    
    return {
        "message": f"Added {len(sample_analyses)} sample analyses",
        "total_history_count": len(in_memory_history)
    }
