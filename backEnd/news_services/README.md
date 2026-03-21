# News Services

Service that generates and distributes a daily news newsletter using a multi-agent AI system. It is not a persistent HTTP service — it runs as a process that executes once a day via a cron job.

## What does it do?

Every day at 7:00 AM, this service launches a pipeline of 7 AI agents that work in sequence to research news, validate it, curate it, format it as HTML, and send it by email.

### Agent pipeline

The pipeline has 4 phases:

**Phase 1 — Research (3 agents)**
- **Tech reporter**: researches the 3 most important stories in the technology world using real-time web search.
- **Sports reporter**: researches the 3 most important stories in the sports world.
- **Geopolitics reporter**: researches the 3 most important stories in global geopolitics.

All three agents use the Serper API to search the internet and retrieve current news from that day.

**Phase 2 — Fact-checking**
- **Fact-checker**: receives the 9 articles from the reporters and validates each one by checking accuracy, source reliability, and content quality. Classifies each article as `approved`, `needs_revision`, or `rejected`. Only articles marked as `approved` move to the next phase.

**Phase 3 — Curation and writing**
- **Editor-in-chief**: selects and organizes the approved articles.
- **Copy editor**: takes the curated articles and generates the complete HTML newsletter, with a responsive design compatible with email clients.

**Phase 4 — Distribution**
- **Mailer agent**: sends the finished newsletter to the notification service (`notification-services`) using JWT authentication. Reports whether the delivery was successful.

### Structured data at each stage
Each agent produces typed data validated with Pydantic. Articles, fact-checking reports, editorial selections, and distribution metrics are all validated against schemas before being passed to the next agent.

## Execution

This service **does not run as an HTTP server**. It is a script that runs, completes the pipeline, and exits. In production it runs as a cron job on the server.

```bash
# Full execution (uses gpt-4o)
uv run python src/news_services/main.py run

# Test mode (uses gpt-4o-mini, faster and cheaper)
uv run python src/news_services/main.py test

# In production, via cron job
./run_daily_news.sh
```

The production cron job is configured as:
```
0 7 * * * cd /home/ubuntu/apps/elberAI/backEnd/news_services && ./run_daily_news.sh
```

The full pipeline takes approximately 3 to 5 minutes to complete.

## Environment variables

```
MODEL=                    # OpenAI model to use (gpt-4o or gpt-4o-mini)
OPENAI_API_KEY=           # OpenAI API key
SERPER_API_KEY=           # Serper API key for web search
SENDER_EMAIL=             # Verified sender email address
NOTIFICATION_SERVICE=     # notification-services URL
JWT_SECRET=               # Secret for signing the token when calling notification-services
CREWAI_TRACING_ENABLED=   # true/false to enable CrewAI traces
TELEMETRY_OPT_OUT=        # true to disable CrewAI telemetry
```

## Setup

```bash
# Install UV (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Configure environment
cp .env.template .env
```

## Code structure

```
src/news_services/
├── main.py      # Entry point and execution modes
├── crew.py      # Definition of the 7 agents and their tasks (CrewAI)
├── models.py    # Pydantic schemas for each pipeline stage
└── tools/       # Web search and email sending tools
```
