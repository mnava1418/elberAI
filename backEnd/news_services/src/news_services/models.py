from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ValidationStatus(Enum):
    """Estados de validación para fact-checking"""
    APPROVED = "approved"
    NEEDS_REVISION = "needs_revision"
    REJECTED = "rejected"

class SourceReliability(Enum):
    """Niveles de confiabilidad de fuentes"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ContentQuality(Enum):
    """Calidad del contenido"""
    FACTUAL = "factual"
    SPECULATIVE = "speculative"
    MISLEADING = "misleading"

class ArticleValidation(BaseModel):
    """Modelo para validación individual de artículos"""
    original_title: str
    validation_status: ValidationStatus
    accuracy_score: float
    source_reliability: SourceReliability
    content_quality: ContentQuality
    fact_check_notes: str
    recommended_changes: Optional[str] = None

class ValidationOverallAssessment(BaseModel):
    """Evaluación general del proceso de validación"""
    total_articles_validated: int
    approved_count: int
    needs_revision_count: int
    rejected_count: int
    quality_score: float
    validation_timestamp: str

class FactCheckingReport(BaseModel):
    """Modelo completo para el reporte de fact-checking"""
    tech_articles: List[ArticleValidation]
    sports_articles: List[ArticleValidation]
    geopolitics_articles: List[ArticleValidation]
    overall_assessment: ValidationOverallAssessment

class FactCheckingReportWrapper(BaseModel):
    """Wrapper para el formato de salida del fact-checker"""
    validation_report: FactCheckingReport

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
    category: str
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