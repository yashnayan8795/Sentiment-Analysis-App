"""
Analysis Repository - Data access layer for analysis data
"""
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pymongo.collection import Collection
from pymongo.errors import PyMongoError

from ..models.analysis_model import AnalysisModel

class AnalysisRepository:
    """Repository for analysis data persistence"""
    
    def __init__(self, collection: Collection):
        self.collection = collection
        self.in_memory_storage: List[AnalysisModel] = []
        self.max_memory_items = 50
    
    async def save_analysis(self, analysis: AnalysisModel) -> AnalysisModel:
        """Save analysis to database or memory fallback"""
        try:
            # Try to save to MongoDB
            if self.collection is not None:
                document = analysis.to_database_document()
                result = self.collection.insert_one(document)
                analysis.id = str(result.inserted_id)
                logging.info(f"Saved analysis to database: {analysis.id}")
                return analysis
        except PyMongoError as e:
            logging.warning(f"Database save failed, using memory fallback: {e}")
        
        # Fallback to in-memory storage
        try:
            # Remove existing analysis with same URL if exists
            self.in_memory_storage = [a for a in self.in_memory_storage if a.article.url != analysis.article.url]
            
            # Add new analysis to beginning
            analysis.id = analysis.id or f"memory-{len(self.in_memory_storage)}"
            self.in_memory_storage.insert(0, analysis)
            
            # Keep only recent items
            if len(self.in_memory_storage) > self.max_memory_items:
                self.in_memory_storage = self.in_memory_storage[:self.max_memory_items]
            
            logging.info(f"Saved analysis to memory: {analysis.id}")
            return analysis
            
        except Exception as e:
            logging.error(f"Memory storage failed: {e}")
            raise e
    
    async def get_recent_analyses(self, limit: int = 50) -> List[AnalysisModel]:
        """Get recent analyses from database or memory"""
        try:
            # Try to get from MongoDB
            if self.collection is not None:
                cursor = self.collection.find().sort("timestamp", -1).limit(limit)
                documents = list(cursor)
                
                analyses = []
                for doc in documents:
                    try:
                        analysis = AnalysisModel.from_database_document(doc)
                        analyses.append(analysis)
                    except Exception as e:
                        logging.warning(f"Failed to parse document {doc.get('_id')}: {e}")
                        continue
                
                if analyses:
                    logging.info(f"Retrieved {len(analyses)} analyses from database")
                    return analyses
        except PyMongoError as e:
            logging.warning(f"Database query failed, using memory fallback: {e}")
        
        # Fallback to in-memory storage
        analyses = self.in_memory_storage[:limit]
        logging.info(f"Retrieved {len(analyses)} analyses from memory")
        return analyses
    
    async def get_analysis_by_id(self, analysis_id: str) -> Optional[AnalysisModel]:
        """Get analysis by ID"""
        try:
            # Try to get from MongoDB
            if self.collection is not None:
                from bson import ObjectId
                try:
                    doc = self.collection.find_one({"_id": ObjectId(analysis_id)})
                    if doc:
                        return AnalysisModel.from_database_document(doc)
                except Exception:
                    # If ObjectId conversion fails, try string search
                    doc = self.collection.find_one({"url": analysis_id})
                    if doc:
                        return AnalysisModel.from_database_document(doc)
        except PyMongoError as e:
            logging.warning(f"Database query failed for ID {analysis_id}: {e}")
        
        # Fallback to in-memory storage
        for analysis in self.in_memory_storage:
            if analysis.id == analysis_id or analysis.article.url == analysis_id:
                return analysis
        
        return None
    
    async def get_analysis_by_url(self, url: str) -> Optional[AnalysisModel]:
        """Get analysis by URL"""
        try:
            # Try to get from MongoDB
            if self.collection is not None:
                doc = self.collection.find_one({"url": url})
                if doc:
                    return AnalysisModel.from_database_document(doc)
        except PyMongoError as e:
            logging.warning(f"Database query failed for URL {url}: {e}")
        
        # Fallback to in-memory storage
        for analysis in self.in_memory_storage:
            if analysis.article.url == url:
                return analysis
        
        return None
    
    async def clear_all_analyses(self) -> int:
        """Clear all analyses"""
        cleared_count = 0
        
        try:
            # Clear from MongoDB
            if self.collection is not None:
                result = self.collection.delete_many({})
                cleared_count += result.deleted_count
                logging.info(f"Cleared {result.deleted_count} analyses from database")
        except PyMongoError as e:
            logging.warning(f"Database clear failed: {e}")
        
        # Clear from memory
        cleared_count += len(self.in_memory_storage)
        self.in_memory_storage.clear()
        logging.info(f"Cleared {cleared_count} analyses from memory")
        
        return cleared_count
    
    async def get_analysis_statistics(self) -> Dict[str, Any]:
        """Get analysis statistics"""
        try:
            # Try to get from MongoDB
            if self.collection is not None:
                total_analyses = self.collection.count_documents({})
                
                # Get sentiment distribution
                pipeline = [
                    {"$group": {"_id": "$sentiment", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}}
                ]
                sentiment_dist = {}
                for doc in self.collection.aggregate(pipeline):
                    sentiment_dist[doc["_id"].lower()] = doc["count"]
                
                # Get average score
                pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}]
                avg_score = 0
                for doc in self.collection.aggregate(pipeline):
                    avg_score = doc.get("avg_score", 0)
                
                # Get recent analyses count (last 24 hours)
                yesterday = datetime.utcnow() - timedelta(days=1)
                recent_count = self.collection.count_documents({
                    "timestamp": {"$gte": yesterday.isoformat()}
                })
                
                return {
                    "total_analyses": total_analyses,
                    "sentiment_distribution": sentiment_dist,
                    "average_score": avg_score,
                    "recent_analyses": recent_count
                }
        except PyMongoError as e:
            logging.warning(f"Database statistics failed: {e}")
        
        # Fallback to in-memory statistics
        total = len(self.in_memory_storage)
        sentiment_dist = {}
        total_score = 0
        
        for analysis in self.in_memory_storage:
            sentiment = analysis.sentiment.sentiment.value
            sentiment_dist[sentiment] = sentiment_dist.get(sentiment, 0) + 1
            total_score += analysis.sentiment.score
        
        return {
            "total_analyses": total,
            "sentiment_distribution": sentiment_dist,
            "average_score": total_score / total if total > 0 else 0,
            "recent_analyses": total
        }
    
    async def health_check(self) -> bool:
        """Check if repository is healthy"""
        try:
            if self.collection is not None:
                # Test database connection
                self.collection.database.client.admin.command('ping')
                return True
            else:
                # If no database, memory storage is always available
                return True
        except Exception as e:
            logging.warning(f"Repository health check failed: {e}")
            return False
    
    async def get_analyses_by_date_range(self, start_date: datetime, end_date: datetime) -> List[AnalysisModel]:
        """Get analyses within date range"""
        try:
            # Try to get from MongoDB
            if self.collection is not None:
                query = {
                    "timestamp": {
                        "$gte": start_date.isoformat(),
                        "$lte": end_date.isoformat()
                    }
                }
                cursor = self.collection.find(query).sort("timestamp", -1)
                documents = list(cursor)
                
                analyses = []
                for doc in documents:
                    try:
                        analysis = AnalysisModel.from_database_document(doc)
                        analyses.append(analysis)
                    except Exception as e:
                        logging.warning(f"Failed to parse document: {e}")
                        continue
                
                return analyses
        except PyMongoError as e:
            logging.warning(f"Database query failed for date range: {e}")
        
        # Fallback to in-memory storage
        analyses = []
        for analysis in self.in_memory_storage:
            analysis_date = analysis.timestamp
            if start_date <= analysis_date <= end_date:
                analyses.append(analysis)
        
        return sorted(analyses, key=lambda x: x.timestamp, reverse=True)
