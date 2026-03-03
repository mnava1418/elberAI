# News Services

A Python microservice for news aggregation and processing using FastAPI.

## Features

- RESTful API for news operations
- News aggregation from multiple sources
- Async/await support for better performance
- Docker containerization
- Health check endpoints

## Setup

### Prerequisites

- Python 3.11+
- pip
- Virtual environment (recommended)

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Run the application:
```bash
python app.py
```

### Docker Setup

1. Build the image:
```bash
docker build -t news-services .
```

2. Run the container:
```bash
docker run -p 8003:8003 --env-file .env news-services
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/news` - Get latest news (to be implemented)

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
flake8 .
```

## Project Structure

```
news-services/
├── app.py              # Main application
├── requirements.txt    # Python dependencies
├── Dockerfile         # Docker configuration
├── .env              # Environment variables
├── .env.example      # Environment template
├── README.md         # Project documentation
├── src/              # Source code modules
├── tests/            # Test files
└── config/           # Configuration files
```