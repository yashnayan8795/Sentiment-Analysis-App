"""
Analysis Service - Business logic for sentiment analysis
"""
import logging
import asyncio
import aiohttp
from typing import Optional, List, Dict, Any
from datetime import datetime
from bs4 import BeautifulSoup
from transformers import pipeline

from ..models.analysis_model import (
    AnalysisModel, ArticleModel, SentimentModel, 
    SentimentType, AnalysisResponseModel
)

class WebScrapingService:
    """Service for web scraping and content extraction"""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    
    async def fetch_content(self, url: str) -> Optional[str]:
        """Fetch HTML content from URL with multiple fallback strategies"""
        approaches = [
            {"ssl": True, "timeout": 15, "verify_ssl": True},
            {"ssl": True, "timeout": 20, "verify_ssl": False},
            {"ssl": False, "timeout": 15, "force_http": True},
        ]
        
        for i, approach in enumerate(approaches):
            try:
                connector = None
                current_url = url
                
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
                    if approach.get("force_http") and url.startswith("https://"):
                        current_url = url.replace("https://", "http://", 1)
                
                async with aiohttp.ClientSession(
                    connector=connector,
                    timeout=aiohttp.ClientTimeout(total=approach["timeout"])
                ) as session:
                    async with session.get(
                        current_url,
                        headers=self.headers,
                        allow_redirects=True,
                        max_redirects=10
                    ) as response:
                        if response.status in [200, 201, 202]:
                            content = await response.text()
                            if len(content) > 500 and any(tag in content.lower() for tag in ['<html', '<body', '<article', '<div']):
                                logging.info(f"Successfully fetched URL {current_url} with approach {i+1}")
                                return content
                        
            except Exception as e:
                logging.warning(f"Approach {i+1} failed for URL {current_url}: {e}")
                continue
        
        logging.error(f"All approaches failed for URL {url}")
        return None
    
    def extract_content(self, html: str) -> tuple[str, str]:
        """Extract heading and body content from HTML"""
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "header", "footer", "aside", "iframe"]):
            element.decompose()
        
        # Extract heading
        heading = "No Heading"
        h1_tag = soup.find("h1")
        if h1_tag and h1_tag.get_text(strip=True):
            heading = h1_tag.get_text(strip=True)
        else:
            title_tag = soup.find("title")
            if title_tag and title_tag.get_text(strip=True):
                heading = title_tag.get_text(strip=True)
            else:
                for selector in ["h2", "h3", ".title", ".headline", "[data-testid='headline']"]:
                    element = soup.select_one(selector)
                    if element and element.get_text(strip=True):
                        heading = element.get_text(strip=True)
                        break
        
        # Extract body content
        body_parts = []
        article_selectors = [
            "article", "[role='main']", ".article-content", ".content", 
            ".story-body", ".entry-content", ".post-content", "#article-body", ".article-body"
        ]
        
        for selector in article_selectors:
            articles = soup.select(selector)
            for article in articles:
                paragraphs = article.find_all("p")
                if len(paragraphs) >= 2:
                    body_parts.extend([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
                    break
            if body_parts:
                break
        
        if not body_parts:
            paragraphs = soup.find_all("p")
            body_parts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True) and len(p.get_text(strip=True)) > 20]
        
        if not body_parts:
            divs = soup.find_all("div")
            for div in divs:
                text = div.get_text(strip=True)
                if len(text) > 100 and len(text.split()) > 10:
                    body_parts.append(text)
        
        body = " ".join(body_parts)
        
        # Clean up text
        import re
        body = re.sub(r'\s+', ' ', body)
        body = re.sub(r'[^\w\s\.,;:!?\-\'"()]', '', body)
        
        if len(heading) > 200:
            heading = heading[:200] + "..."
        
        return heading, body

class AIService:
    """Service for AI model operations"""
    
    def __init__(self):
        self.summarizer = None
        self.sentiment_analyzer = None
        self._models_loaded = False
    
    def load_models(self):
        """Load AI models"""
        if self._models_loaded:
            return
        
        try:
            logging.info("Loading AI models...")
            self.summarizer = pipeline("summarization", model="t5-small")
            self.sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
            self._models_loaded = True
            logging.info("AI models loaded successfully")
        except Exception as e:
            logging.error(f"Failed to load AI models: {e}")
            raise e
    
    def analyze_sentiment(self, text: str) -> SentimentModel:
        """Analyze sentiment of text"""
        if not self._models_loaded:
            self.load_models()
        
        try:
            # Process with AI models
            summary_result = self.summarizer(text, max_length=50, min_length=30, do_sample=False)
            sentiment_result = self.sentiment_analyzer(text)
            
            # Convert to list if needed
            if hasattr(summary_result, '__iter__') and not isinstance(summary_result, str):
                summary_list = list(summary_result)
            else:
                summary_list = [summary_result] if summary_result else []
                
            if hasattr(sentiment_result, '__iter__') and not isinstance(sentiment_result, str):
                sentiment_list = list(sentiment_result)
            else:
                sentiment_list = [sentiment_result] if sentiment_result else []
            
            if not summary_list or not sentiment_list:
                raise ValueError("AI model processing failed")
            
            # Extract data
            summary_data = summary_list[0]
            sentiment_data = sentiment_list[0]
            
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
            
            # Map sentiment labels
            sentiment_mapping = {
                'POSITIVE': SentimentType.POSITIVE,
                'NEGATIVE': SentimentType.NEGATIVE,
                'LABEL_0': SentimentType.NEGATIVE,
                'LABEL_1': SentimentType.POSITIVE
            }
            
            sentiment_type = sentiment_mapping.get(sentiment_label.upper(), SentimentType.NEUTRAL)
            
            # Calculate breakdown
            breakdown = self._calculate_breakdown(sentiment_type, sentiment_score)
            
            return SentimentModel(
                sentiment=sentiment_type,
                score=sentiment_score,
                confidence=sentiment_score,
                breakdown=breakdown
            )
            
        except Exception as e:
            logging.error(f"AI analysis error: {e}")
            raise e
    
    def _calculate_breakdown(self, sentiment: SentimentType, score: float) -> Dict[str, float]:
        """Calculate sentiment breakdown percentages"""
        if sentiment == SentimentType.POSITIVE:
            return {
                "positive": score,
                "neutral": (1 - score) * 0.6,
                "negative": (1 - score) * 0.4
            }
        elif sentiment == SentimentType.NEGATIVE:
            return {
                "negative": score,
                "neutral": (1 - score) * 0.6,
                "positive": (1 - score) * 0.4
            }
        else:
            return {
                "neutral": 0.6,
                "positive": 0.2,
                "negative": 0.2
            }

class AnalysisService:
    """Main analysis service coordinating all components"""
    
    def __init__(self, web_scraping_service: WebScrapingService, ai_service: AIService):
        self.web_scraping_service = web_scraping_service
        self.ai_service = ai_service
    
    async def analyze_url(self, url: str) -> AnalysisResponseModel:
        """Analyze article from URL"""
        try:
            # Fetch and extract content
            html = await self.web_scraping_service.fetch_content(url)
            if not html:
                return AnalysisResponseModel.error_response(
                    f"Unable to access the website at {url}. This could be due to the website blocking automated requests or network issues."
                )
            
            heading, body = self.web_scraping_service.extract_content(html)
            
            # Validate content
            if not body.strip() or len(body.strip()) < 50:
                return AnalysisResponseModel.error_response(
                    "No readable text content found in the article. Please try a different URL with more accessible text content."
                )
            
            # Prepare content for analysis
            content_for_analysis = body[:1000]
            if len(content_for_analysis.strip()) < 50:
                content_for_analysis = f"{heading}. {body}"[:1000]
            
            # Analyze sentiment
            sentiment = self.ai_service.analyze_sentiment(content_for_analysis)
            
            # Create article model
            article = ArticleModel(
                url=url,
                title=heading,
                description=body[:200] + "..." if len(body) > 200 else body,
                content=body
            )
            
            # Create analysis model
            analysis = AnalysisModel(
                article=article,
                sentiment=sentiment,
                summary=content_for_analysis[:200] + "..." if len(content_for_analysis) > 200 else content_for_analysis,
                raw_data={
                    "content_length": len(body),
                    "analysis_timestamp": datetime.utcnow().isoformat()
                }
            )
            
            return AnalysisResponseModel.success_response(analysis)
            
        except Exception as e:
            logging.error(f"Analysis service error: {e}")
            return AnalysisResponseModel.error_response(f"Analysis failed: {str(e)}")
    
    def analyze_text(self, text: str) -> AnalysisResponseModel:
        """Analyze sentiment of provided text"""
        try:
            if len(text.strip()) < 10:
                return AnalysisResponseModel.error_response("Text must be at least 10 characters long")
            
            # Analyze sentiment
            sentiment = self.ai_service.analyze_sentiment(text)
            
            # Create article model
            article = ArticleModel(
                url="text-input",
                title="Text Analysis",
                description=text[:200] + "..." if len(text) > 200 else text,
                content=text
            )
            
            # Create analysis model
            analysis = AnalysisModel(
                article=article,
                sentiment=sentiment,
                summary=text[:200] + "..." if len(text) > 200 else text,
                raw_data={
                    "content_length": len(text),
                    "analysis_timestamp": datetime.utcnow().isoformat()
                }
            )
            
            return AnalysisResponseModel.success_response(analysis)
            
        except Exception as e:
            logging.error(f"Text analysis error: {e}")
            return AnalysisResponseModel.error_response(f"Text analysis failed: {str(e)}")
