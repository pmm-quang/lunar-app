#!/bin/bash

echo "Starting FCM API Server..."
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "ERROR: serviceAccountKey.json not found!"
    echo "Please download Service Account Key from Firebase Console"
    echo "and place it in the server/ directory"
    echo
    exit 1
fi

# Start the server
echo "Starting server on port 3001..."
npm run dev

