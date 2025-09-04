#!/usr/bin/env python3
"""
Simple Backend Runner - No Auto-reload for Windows Stability
"""

import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Sentiment Analysis Backend Server (Stable Mode)...")
    print("📊 FastAPI server will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    print("🔒 Auto-reload is disabled for stability")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disabled for Windows stability
        log_level="info"
    )