"""
News Services - Main Application
"""

from dotenv import load_dotenv

from src.config.settings import settings

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print('News Services')