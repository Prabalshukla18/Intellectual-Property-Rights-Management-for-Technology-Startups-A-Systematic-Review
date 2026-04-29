#!/bin/bash
echo "======================================"
echo "  IP Manager — Starting servers"
echo "======================================"

# Start backend
echo ""
echo "[1/2] Starting FastAPI backend on port 8000..."
cd backend
python -m venv venv 2>/dev/null || true
source venv/bin/activate 2>/dev/null || true
pip install -r requirements.txt -q
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Start frontend
echo ""
echo "[2/2] Starting React frontend on port 3000..."
cd frontend
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================"
echo "  Backend  : http://localhost:8000"
echo "  Frontend  : http://localhost:3000"
echo "  API Docs  : http://localhost:8000/docs"
echo "======================================"
echo "  Press Ctrl+C to stop both servers"
echo "======================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
