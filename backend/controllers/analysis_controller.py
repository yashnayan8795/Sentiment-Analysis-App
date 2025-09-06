"""
Analysis Controller - Handles HTTP requests and coordinates services
"""
import logging
from typing import List, Optional
from fastapi import HTTPException, Depends
from pymongo.collection import Collection

from ..models.analysis_model import (
    URLInputModel, TextInputModel, AnalysisResponseModel, AnalysisModel
)
from ..services.analysis_service import AnalysisService, WebScrapingService, AIService
from ..repositories.analysis_repository import AnalysisRepository

class AnalysisController:
    """Controller for analysis-related endpoints"""
    
    def __init__(self, analysis_service: AnalysisService, analysis_repository: AnalysisRepository):
        self.analysis_service = analysis_service
        self.analysis_repository = analysis_repository
    
    async def analyze_article(self, url_input: URLInputModel) -> dict:
        """Analyze article from URL"""
        try:
            # Perform analysis
            response = await self.analysis_service.analyze_url(url_input.url)
            
            if not response.success:
                raise HTTPException(status_code=400, detail=response.error)
            
            # Save to repository
            analysis = response.data
            saved_analysis = await self.analysis_repository.save_analysis(analysis)
            
            # Return API response format
            return saved_analysis.to_api_response()
            
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Controller error in analyze_article: {e}")
            raise HTTPException(status_code=500, detail="Internal server error during analysis")
    
    async def analyze_text(self, text_input: TextInputModel) -> dict:
        """Analyze sentiment of provided text"""
        try:
            # Perform analysis
            response = self.analysis_service.analyze_text(text_input.text)
            
            if not response.success:
                raise HTTPException(status_code=400, detail=response.error)
            
            # Save to repository
            analysis = response.data
            saved_analysis = await self.analysis_repository.save_analysis(analysis)
            
            # Return API response format
            return saved_analysis.to_api_response()
            
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Controller error in analyze_text: {e}")
            raise HTTPException(status_code=500, detail="Internal server error during text analysis")
    
    async def get_analysis_history(self, limit: int = 50) -> dict:
        """Get analysis history"""
        try:
            analyses = await self.analysis_repository.get_recent_analyses(limit)
            
            return {
                "articles": [analysis.to_api_response() for analysis in analyses],
                "source": "database",
                "total": len(analyses)
            }
            
        except Exception as e:
            logging.error(f"Controller error in get_analysis_history: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve analysis history")
    
    async def get_analysis_by_id(self, analysis_id: str) -> dict:
        """Get specific analysis by ID"""
        try:
            analysis = await self.analysis_repository.get_analysis_by_id(analysis_id)
            
            if not analysis:
                raise HTTPException(status_code=404, detail="Analysis not found")
            
            return analysis.to_api_response()
            
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Controller error in get_analysis_by_id: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve analysis")
    
    async def get_raw_sentiment(self, url: str) -> dict:
        """Get raw sentiment data for URL"""
        try:
            # Find analysis by URL
            analysis = await self.analysis_repository.get_analysis_by_url(url)
            
            if not analysis:
                raise HTTPException(status_code=404, detail="Analysis not found for this URL")
            
            return {
                "sentiment": analysis.sentiment.sentiment.value,
                "score": analysis.sentiment.score,
                "confidence": analysis.sentiment.confidence,
                "raw_data": analysis.sentiment.breakdown
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Controller error in get_raw_sentiment: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve raw sentiment data")
    
    async def clear_history(self) -> dict:
        """Clear all analysis history"""
        try:
            count = await self.analysis_repository.clear_all_analyses()
            
            return {
                "message": f"Cleared {count} analyses from history",
                "cleared_count": count
            }
            
        except Exception as e:
            logging.error(f"Controller error in clear_history: {e}")
            raise HTTPException(status_code=500, detail="Failed to clear analysis history")
    
    async def get_analysis_stats(self) -> dict:
        """Get analysis statistics"""
        try:
            stats = await self.analysis_repository.get_analysis_statistics()
            
            return {
                "total_analyses": stats["total_analyses"],
                "sentiment_distribution": stats["sentiment_distribution"],
                "average_score": stats["average_score"],
                "recent_analyses": stats["recent_analyses"]
            }
            
        except Exception as e:
            logging.error(f"Controller error in get_analysis_stats: {e}")
            raise HTTPException(status_code=500, detail="Failed to retrieve analysis statistics")
    
    async def health_check(self) -> dict:
        """Health check endpoint"""
        try:
            # Check if services are available
            ai_available = self.analysis_service.ai_service._models_loaded
            db_available = await self.analysis_repository.health_check()
            
            return {
                "status": "healthy" if ai_available and db_available else "degraded",
                "ai_service": "available" if ai_available else "unavailable",
                "database": "available" if db_available else "unavailable",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Controller error in health_check: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
