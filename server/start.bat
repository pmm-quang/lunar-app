@echo off
echo Starting FCM API Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if serviceAccountKey.json exists
if not exist "serviceAccountKey.json" (
    echo ERROR: serviceAccountKey.json not found!
    echo Please download Service Account Key from Firebase Console
    echo and place it in the server/ directory
    echo.
    pause
    exit /b 1
)

REM Start the server
echo Starting server on port 3001...
npm run dev

