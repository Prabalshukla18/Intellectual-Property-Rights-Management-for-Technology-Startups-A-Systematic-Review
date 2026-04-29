@echo off
echo ======================================
echo   IP Manager -- Starting servers
echo ======================================

echo.
echo [1/2] Starting FastAPI backend on port 8000...
cd backend
pip install -r requirements.txt -q
start "IP Manager Backend" cmd /k "python main.py"
cd ..

timeout /t 2 /nobreak >nul

echo.
echo [2/2] Starting React frontend on port 3000...
cd frontend
npm install -q
start "IP Manager Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ======================================
echo   Backend  : http://localhost:8000
echo   Frontend  : http://localhost:3000
echo   API Docs  : http://localhost:8000/docs
echo ======================================
echo   Close both terminal windows to stop
echo ======================================
pause
