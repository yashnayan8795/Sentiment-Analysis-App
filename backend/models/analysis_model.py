"""
Analysis Model - Data models for sentiment analysis
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class ArticleModel(BaseModel):
    """Article data model"""
    url: str = Field(..., description="Article URL")
    title: str = Field(..., description="Article title")
    description: Optional[str] = Field(None, description="Article description")
    content: Optional[str] = Field(None, description="Article content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v
    
    @validator('title')
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        return v.strip()

class SentimentModel(BaseModel):
    """Sentiment analysis data model"""
    sentiment: SentimentType = Field(..., description="Sentiment classification")
    score: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence (0-1)")
    breakdown: Dict[str, float] = Field(default_factory=dict, description="Sentiment breakdown")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('breakdown')
    def validate_breakdown(cls, v):
        if v:
            total = sum(v.values())
            if abs(total - 1.0) > 0.01:  # Allow small floating point errors
                raise ValueError('Breakdown values must sum to 1.0')
        return v

class AnalysisModel(BaseModel):
    """Complete analysis model combining article and sentiment"""
    id: Optional[str] = Field(None, description="Unique analysis ID")
    article: ArticleModel = Field(..., description="Article data")
    sentiment: SentimentModel = Field(..., description="Sentiment analysis")
    summary: str = Field(..., description="Generated summary")
    raw_data: Dict[str, Any] = Field(default_factory=dict, description="Raw analysis data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    def to_api_response(self) -> Dict[str, Any]:
        """Convert to API response format"""
        return {
            "id": self.id or self.article.url,
            "url": self.article.url,
            "heading": self.article.title,
            "meta_description": self.article.description or "",
            "summary_with_sentiment": self.summary,
            "overall_sentiment": self.sentiment.sentiment.value,
            "score": self.sentiment.score,
            "confidence": self.sentiment.confidence,
            "timestamp": self.timestamp.isoformat()
        }
    
    def to_database_document(self) -> Dict[str, Any]:
        """Convert to MongoDB document format"""
        return {
            "url": self.article.url,
            "heading": self.article.title,
            "summary": self.summary,
            "sentiment": self.sentiment.sentiment.value.upper(),
            "score": self.sentiment.score,
            "confidence": self.sentiment.confidence,
            "breakdown": self.sentiment.breakdown,
            "timestamp": self.timestamp.isoformat(),
            "raw_data": self.raw_data
        }
    
    @classmethod
    def from_database_document(cls, doc: Dict[str, Any]) -> 'AnalysisModel':
        """Create from MongoDB document"""
        return cls(
            id=doc.get('_id'),
            article=ArticleModel(
                url=doc['url'],
                title=doc['heading'],
                description=doc.get('summary', ''),
                content=doc.get('content', ''),
                timestamp=datetime.fromisoformat(doc['timestamp'].replace('Z', '+00:00'))
            ),
            sentiment=SentimentModel(
                sentiment=SentimentType(doc['sentiment'].lower()),
                score=doc['score'],
                confidence=doc.get('confidence', doc['score']),
                breakdown=doc.get('breakdown', {}),
                timestamp=datetime.fromisoformat(doc['timestamp'].replace('Z', '+00:00'))
            ),
            summary=doc['summary'],
            raw_data=doc.get('raw_data', {}),
            timestamp=datetime.fromisoformat(doc['timestamp'].replace('Z', '+00:00'))
        )

class URLInputModel(BaseModel):
    """URL input validation model"""
    url: str = Field(..., description="URL to analyze")
    
    @validator('url')
    def validate_url(cls, v):
        if not v or not v.strip():
            raise ValueError('URL is required')
        
        v = v.strip()
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        
        try:
            from urllib.parse import urlparse
            parsed = urlparse(v)
            if not parsed.netloc:
                raise ValueError('Invalid URL format')
        except Exception:
            raise ValueError('Invalid URL format')
        
        return v

class TextInputModel(BaseModel):
    """Text input validation model"""
    text: str = Field(..., min_length=10, description="Text to analyze (minimum 10 characters)")
    
    @validator('text')
    def validate_text(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Text must be at least 10 characters long')
        return v.strip()

class AnalysisResponseModel(BaseModel):
    """Standardized analysis response model"""
    success: bool = Field(..., description="Whether the analysis was successful")
    data: Optional[AnalysisModel] = Field(None, description="Analysis data if successful")
    error: Optional[str] = Field(None, description="Error message if failed")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @classmethod
    def success_response(cls, analysis: AnalysisModel) -> 'AnalysisResponseModel':
        """Create success response"""
        return cls(success=True, data=analysis)
    
    @classmethod
    def error_response(cls, error_message: str) -> 'AnalysisResponseModel':
        """Create error response"""
        return cls(success=False, error=error_message)
