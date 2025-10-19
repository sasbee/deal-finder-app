# Deal Finder Backend

AI-powered deal search API using Perplexity AI.

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/sasbee/deal-finder-backend.git
cd deal-finder-backend

# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Add your PERPLEXITY_API_KEY to .env

# Run
python app.py
```

## 📡 API

- POST /api/search-deals - Search for deals
- GET /api/health - Health check

## 🔗 Frontend

https://github.com/sasbee/deal-finder-app

## 📄 License

MIT
