# IP Manager — AI-Powered Intellectual Property Rights System

A complete full-stack prototype for managing Intellectual Property using AI and Data Science.
Built for: research papers, hackathons, and student projects.

---

## Project Structure

```
ip-manager/
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Python dependencies
│   └── modules/
│       ├── patent_analyzer.py   # Sentence Transformers + FAISS similarity
│       ├── trademark_checker.py # Phonetic + image hash matching
│       ├── prior_art.py         # BM25 keyword retrieval
│       ├── risk_scorer.py       # Dashboard aggregation
│       └── doc_processor.py     # PDF / text extraction
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Layout + routing
│       ├── index.css            # Global design system
│       ├── utils/api.js         # Axios API client
│       └── pages/
│           ├── Dashboard.jsx    # Main analytics dashboard
│           ├── PatentSearch.jsx # Patent similarity search
│           ├── TrademarkCheck.jsx # Trademark conflict detector
│           ├── PriorArt.jsx     # Prior art BM25 analyzer
│           └── Reports.jsx      # Report generation + download
└── README.md
```

---

## Quick Start

### Step 1 — Backend Setup

```bash
cd ip-manager/backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install required dependencies
pip install -r requirements.txt

# Start the API server
python main.py
# API will be live at: http://localhost:8000
# Swagger docs at:     http://localhost:8000/docs
```

### Step 2 — Frontend Setup

```bash
cd ip-manager/frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
# Frontend at: http://localhost:3000
```

Open http://localhost:3000 in your browser.

---

## Dependencies

### Backend (required)
- fastapi
- uvicorn
- pydantic
- python-multipart
- scikit-learn        (TF-IDF fallback for patent search)
- numpy

### Backend (optional — upgrade AI quality)
```bash
pip install sentence-transformers faiss-cpu PyMuPDF Pillow imagehash
```
- sentence-transformers → semantic patent embeddings (replaces TF-IDF)
- faiss-cpu            → fast million-scale vector search
- PyMuPDF              → PDF text extraction
- Pillow + imagehash   → logo image similarity

### Frontend
- React 18 + Vite
- Recharts (charts)
- Lucide React (icons)
- Axios (HTTP)
- React Router DOM

---

## API Endpoints

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | /api/patent/search            | Patent similarity search       |
| POST   | /api/patent/upload            | Upload PDF patent              |
| POST   | /api/trademark/check-text     | Trademark text conflict check  |
| POST   | /api/trademark/check-image    | Logo image conflict check      |
| POST   | /api/prior-art/analyze        | BM25 prior art search          |
| GET    | /api/dashboard/summary        | Dashboard metrics              |
| GET    | /api/dashboard/trends         | Monthly trend data             |
| GET    | /api/dashboard/alerts         | Active alerts                  |

Full interactive docs: http://localhost:8000/docs

---

## Upgrading to Real Patent Data

### Option A — PatentsView API (free, no signup)
```python
import requests
r = requests.post("https://api.patentsview.org/patents/query", json={
    "q": {"_text_any": {"patent_abstract": "machine learning neural network"}},
    "f": ["patent_id", "patent_title", "patent_abstract", "assignee_organization", "patent_date"],
    "o": {"per_page": 100}
})
patents = r.json()["patents"]
# Feed into patent_analyzer.add_patents(patents)
```

### Option B — HUPD Dataset (340k+ patents, on Hugging Face)
```bash
pip install datasets
```
```python
from datasets import load_dataset
dataset = load_dataset("harvard-lil/hupd", split="train[:1000]")
```

---

## Deployment

### Render.com (free tier, recommended for students)

Backend:
1. Push to GitHub
2. New Web Service → connect repo → set root to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Frontend:
1. New Static Site → connect repo → set root to `frontend/`
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Set env var: `VITE_API_URL=https://your-backend.onrender.com`

### Docker (optional)
```bash
# Backend
docker build -t ip-manager-api ./backend
docker run -p 8000:8000 ip-manager-api

# Or use docker-compose (add docker-compose.yml for both services)
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, Recharts, Lucide        |
| Backend    | FastAPI, Python 3.10+                   |
| AI/NLP     | Sentence Transformers, scikit-learn     |
| Vector DB  | FAISS (approximate nearest neighbor)    |
| Similarity | BM25, TF-IDF, Levenshtein, pHash        |
| Charts     | Recharts (radar, line, pie, bar)        |

---

## Research Paper Contribution

This system demonstrates:
1. Semantic patent similarity using transformer embeddings (all-MiniLM-L6-v2)
2. Multi-modal trademark matching (text phonetic + image perceptual hash)
3. BM25-based prior art retrieval with keyword overlap highlighting
4. Composite IP risk scoring with weighted multi-module aggregation
5. Full-stack AI system architecture for startup IP management

---

Built as a research prototype · MIT License
