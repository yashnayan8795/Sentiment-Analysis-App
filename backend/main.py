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
    """Fetch HTML content from URL with enhanced reliability and error handling"""
    
    # Enhanced headers with better compatibility
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    
    # Multiple fallback approaches with improved error handling
    approaches = [
        # Approach 1: Standard HTTPS with SSL verification
        {"ssl": True, "timeout": 15, "verify_ssl": True},
        # Approach 2: HTTPS with relaxed SSL
        {"ssl": True, "timeout": 20, "verify_ssl": False},
        # Approach 3: Force HTTP if available
        {"ssl": False, "timeout": 15, "force_http": True},
    ]
    
    for i, approach in enumerate(approaches):
        try:
            connector = None
            current_url = url
            
            # Handle SSL configuration
            if approach["ssl"]:
                import ssl
                if approach.get("verify_ssl", True):
                    connector = aiohttp.TCPConnector(ssl=True)
                else:
                    ssl_context = ssl.create_default_context()
                    ssl_context.check_hostname = False
                    ssl_context.verify_mode = ssl.CERT_NONE
                    connector = aiohttp.TCPConnector(ssl=ssl_context)
            else:
                connector = aiohttp.TCPConnector(ssl=False)
                # Try HTTP version if force_http is enabled
                if approach.get("force_http") and url.startswith("https://"):
                    current_url = url.replace("https://", "http://", 1)
            
            logging.info(f"Attempting approach {i+1} for URL: {current_url}")
            
            async with aiohttp.ClientSession(
                connector=connector,
                timeout=aiohttp.ClientTimeout(total=approach["timeout"])
            ) as session:
                async with session.get(
                    current_url,
                    headers=headers,
                    allow_redirects=True,
                    max_redirects=10
                ) as response:
                    # Log response details
                    logging.info(f"Approach {i+1}: Status {response.status}, Content-Type: {response.headers.get('content-type', 'unknown')}")
                    
                    # Accept various successful status codes
                    if response.status in [200, 201, 202]:
                        content = await response.text()
                        
                        # Enhanced content validation
                        if len(content) > 500 and any(tag in content.lower() for tag in ['<html', '<body', '<article', '<div']):
                            logging.info(f"✅ Successfully fetched URL {current_url} with approach {i+1} (Content length: {len(content)} chars)")
                            return content
                        else:
                            logging.warning(f"Approach {i+1}: Content too short or invalid HTML structure (length: {len(content)})")
                    
                    # Handle redirects and other status codes
                    elif response.status in [301, 302, 303, 307, 308]:
                        redirect_url = response.headers.get('location', '')
                        logging.info(f"Approach {i+1}: Redirect to {redirect_url}")
                    elif response.status == 403:
                        logging.warning(f"Approach {i+1}: Access forbidden (403) - website may block automated requests")
                    elif response.status == 503:
                        logging.warning(f"Approach {i+1}: Service unavailable (503) - website may be blocking bots")
                    else:
                        logging.warning(f"Approach {i+1}: Unexpected status {response.status}")
                        
        except asyncio.TimeoutError:
            logging.warning(f"Approach {i+1}: Timeout after {approach['timeout']} seconds for URL {current_url}")
        except aiohttp.ClientSSLError as e:
            logging.warning(f"Approach {i+1}: SSL error for URL {current_url}: {e}")
        except aiohttp.ClientError as e:
            logging.warning(f"Approach {i+1}: Client error for URL {current_url}: {e}")
        except Exception as e:
            logging.warning(f"Approach {i+1}: Unexpected error for URL {current_url}: {type(e).__name__}: {e}")
    
    # If all approaches failed, provide detailed error information
    logging.error(f"❌ All {len(approaches)} approaches failed for URL {url}")
    return None

def scrape_content(html: str) -> tuple[str, str]:
    """Extract heading and body content from HTML with enhanced parsing"""
    soup = BeautifulSoup(html, "html.parser")
    
    # Remove unwanted elements that might interfere with content extraction
    for element in soup(["script", "style", "nav", "header", "footer", "aside", "iframe"]):
        element.decompose()
    
    # Enhanced heading extraction - try multiple strategies
    heading = "No Heading"
    
    # Strategy 1: Look for h1 tag
    h1_tag = soup.find("h1")
    if h1_tag and h1_tag.get_text(strip=True):
        heading = h1_tag.get_text(strip=True)
    else:
        # Strategy 2: Look for title tag
        title_tag = soup.find("title")
        if title_tag and title_tag.get_text(strip=True):
            heading = title_tag.get_text(strip=True)
        else:
            # Strategy 3: Look for article title or other heading tags
            for selector in ["h2", "h3", ".title", ".headline", "[data-testid='headline']"]:
                element = soup.select_one(selector)
                if element and element.get_text(strip=True):
                    heading = element.get_text(strip=True)
                    break
    
    # Enhanced body content extraction
    body_parts = []
    
    # Strategy 1: Look for article content specifically
    article_selectors = [
        "article", 
        "[role='main']", 
        ".article-content", 
        ".content", 
        ".story-body", 
        ".entry-content",
        ".post-content",
        "#article-body",
        ".article-body"
    ]
    
    article_found = False
    for selector in article_selectors:
        articles = soup.select(selector)
        for article in articles:
            paragraphs = article.find_all("p")
            if len(paragraphs) >= 2:  # Ensure substantial content
                body_parts.extend([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
                article_found = True
                break
        if article_found:
            break
    
    # Strategy 2: If no article content found, fall back to all paragraphs
    if not body_parts:
        paragraphs = soup.find_all("p")
        body_parts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True) and len(p.get_text(strip=True)) > 20]
    
    # Strategy 3: If still no content, try div elements with substantial text
    if not body_parts:
        divs = soup.find_all("div")
        for div in divs:
            text = div.get_text(strip=True)
            if len(text) > 100 and len(text.split()) > 10:  # Substantial text content
                body_parts.append(text)
    
    # Join all body parts and clean up
    body = " ".join(body_parts)
    
    # Clean up the text
    import re
    body = re.sub(r'\s+', ' ', body)  # Normalize whitespace
    body = re.sub(r'[^\w\s\.,;:!?\-\'"()]', '', body)  # Remove special characters but keep punctuation
    
    # Limit heading length
    if len(heading) > 200:
        heading = heading[:200] + "..."
    
    logging.info(f"📋 Content extraction summary: Heading length: {len(heading)}, Body length: {len(body)} chars, Paragraphs found: {len(body_parts)}")
    
    return heading, body

@app.post("/analyze/")
async def analyze_article(data: URLInput):
    """Analyze sentiment of a news article from URL with enhanced error handling"""
    logging.info(f"🔍 Starting analysis for URL: {data.url}")
    
    # Validate URL format first
    try:
        from urllib.parse import urlparse
        parsed = urlparse(data.url)
        if not parsed.scheme or not parsed.netloc:
            raise HTTPException(
                status_code=400,
                detail="Invalid URL format. Please provide a complete URL with http:// or https://"
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"URL validation failed: {str(e)}"
        )
    
    html = await fetch_content(data.url)
    if not html:
        # Provide more specific error messages based on common scenarios
        domain = data.url.split('/')[2] if '/' in data.url else data.url
        
        error_message = f"Unable to access the website at {data.url}. "
        
        if 'cnn.com' in domain or 'bbc.com' in domain or 'ndtv.com' in domain:
            error_message += "This news website appears to block automated requests. "
        
        error_message += "This could be due to:\n"
        error_message += "• The website blocking automated requests (common with major news sites)\n"
        error_message += "• Network connectivity issues\n"
        error_message += "• Invalid or broken URL\n"
        error_message += "• Website temporarily unavailable\n\n"
        error_message += "💡 Try:\n"
        error_message += "• A different news article from a smaller news site\n"
        error_message += "• A blog post or article from a less restrictive website\n"
        error_message += "• Check if the URL is correct and accessible in your browser"
        
        raise HTTPException(status_code=400, detail=error_message)

    heading, body = scrape_content(html)
    logging.info(f"📄 Extracted content - Heading: '{heading[:50]}...', Body length: {len(body)} chars")
    
    # Enhanced content validation
    if not body.strip():
        raise HTTPException(
            status_code=400, 
            detail="No readable text content found in the article. This might be due to:\n" +
                   "• The page being mostly images or videos\n" +
                   "• JavaScript-rendered content that requires a browser\n" +
                   "• Paywall or subscription-protected content\n\n" +
                   "Please try a different article URL with more accessible text content."
        )
    
    # Check for minimum content requirements
    if len(body.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail=f"Article content too short ({len(body.strip())} characters). " +
                   "Please try a URL with a longer article for better analysis."
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
        logging.error(f"🤖 AI model processing error: {e}")
        error_detail = "Error processing article with AI models. "
        
        if "CUDA" in str(e) or "GPU" in str(e):
            error_detail += "GPU/CUDA issue detected - using CPU fallback."
        elif "memory" in str(e).lower():
            error_detail += "Memory issue - try a shorter article."
        elif "timeout" in str(e).lower():
            error_detail += "Processing timeout - the article might be too long."
        else:
            error_detail += f"Technical error: {str(e)[:100]}..."
            
        raise HTTPException(status_code=500, detail=error_detail)

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
