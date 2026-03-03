"""
Test configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from app import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture 
def mock_news_service():
    """Mock news service for testing"""
    return AsyncMock()