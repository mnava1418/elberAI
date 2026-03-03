"""
Configuration settings for the News Services application
"""
import os
from typing import Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8003
    debug: bool = True
    
# Global settings instance
settings = Settings()