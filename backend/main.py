from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
import asyncio
import aiohttp
import async_timeout
import logging
from bs4 import BeautifulSoup
from transformers import pipeline

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Sentiment Analysis API is running!"}

# MongoDB Connection
MONGO_URI = "mongodb+srv://user:pass123ynm@cluster0.16nk9hq.mongodb.net/sentiment-analysis"
client = MongoClient(MONGO_URI)
db = client["sentiment-analysis"]
collection = db["scraped_articles"]

# Initialize Transformers Models
summarizer = pipeline("summarization", model="t5-small")
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

# Headers for web scraping
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0 Safari/537.36"}

class URLInput(BaseModel):
    url: str

async def fetch_content(url):
    async with aiohttp.ClientSession() as session:
        try:
            async with async_timeout.timeout(10):
                async with session.get(url, headers=HEADERS) as response:
                    response.raise_for_status()
                    return await response.text()
        except Exception as e:
            logging.error(f"Failed to fetch URL {url}: {e}")
            return None

def scrape_content(html):
    soup = BeautifulSoup(html, "html.parser")
    heading = soup.find("h1").get_text(strip=True) if soup.find("h1") else "No Heading"
    paragraphs = soup.find_all("p")
    body = " ".join([p.get_text(strip=True) for p in paragraphs])
    return heading, body

@app.post("/analyze/")
async def analyze_article(data: URLInput):
    html = await fetch_content(data.url)
    if not html:
        raise HTTPException(status_code=400, detail="Failed to fetch URL")

    heading, body = scrape_content(html)
    summary = summarizer(body[:512], max_length=50, min_length=30, do_sample=False)[0]['summary_text']
    sentiment = sentiment_analyzer(body[:512])[0]

    result = {
        "heading": heading,
        "summary": summary,
        "sentiment": sentiment["label"],
        "score": sentiment["score"]
    }

    collection.insert_one({"url": data.url, **result})
    return result

@app.get("/history/")
async def get_history():
    articles = list(collection.find({}, {"_id": 0}))
    return {"articles": articles}
