from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class NewsArticle(BaseModel):
    """Modelo para artículos de noticias"""
    title: str
    summary: str
    source: str
    url: str    
    published_date: Optional[str] = None
    relevance_score: Optional[float] = None

class ResearchOutput(BaseModel):
    """Modelo para la salida de las tareas de investigación"""
    category: str  # "technology" o "sports"
    articles: List[NewsArticle]
    total_articles_found: int
    research_timestamp: str

class CuratedNews(BaseModel):
    """Modelo para las noticias curadas por el editor"""
    selected_articles: List[NewsArticle]
    editorial_notes: str
    curation_rationale: str
    final_selection_count: int

class DistributionStatus(Enum):
    """Estados de distribución"""
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"

class EmailDistributionReport(BaseModel):
    """Modelo para el reporte de distribución de email"""
    status: DistributionStatus
    recipient_email: str
    send_date: str
    successful_send: bool
    delivery_status: str
    error_details: Optional[str] = None
    tracking_enabled: bool
    estimated_delivery_time: Optional[str] = None