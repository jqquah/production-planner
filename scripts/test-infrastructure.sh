#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Test Development Environment ---
echo "--- Testing Development Environment ---"

# Build and start containers in detached mode
echo "Building and starting dev containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 15

# Test frontend
echo "Testing frontend..."
if curl --silent --fail http://localhost | grep -q "Soluxe Production Planner"; then
  echo "✅ Frontend is responding correctly."
else
  echo "❌ Frontend test failed."
  docker-compose logs
  docker-compose down
  exit 1
fi

# Test backend
echo "Testing backend..."
if curl --silent --fail http://localhost/api | grep -q "Backend is running!"; then
  echo "✅ Backend is responding correctly."
else
  echo "❌ Backend test failed."
  docker-compose logs
  docker-compose down
  exit 1
fi

# Clean up development environment
echo "Shutting down dev containers..."
docker-compose down

echo "✅ Development environment test passed!"

# --- Test Production Environment ---
echo "\n--- Testing Production Environment ---"

# Create a temporary .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating temporary .env file for production test..."
  cp .env.example .env
fi

# Build and start containers in detached mode
echo "Building and starting prod containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 15

# Test frontend (served by Nginx)
echo "Testing frontend (production)..."
if curl --silent --fail http://localhost | grep -q "Soluxe Production Planner"; then
  echo "✅ Production frontend is responding correctly."
else
  echo "❌ Production frontend test failed."
  docker-compose -f docker-compose.prod.yml logs
  docker-compose -f docker-compose.prod.yml down
  exit 1
fi

# Test backend (proxied by Nginx)
echo "Testing backend (production)..."
if curl --silent --fail http://localhost/api | grep -q "Backend is running!"; then
  echo "✅ Production backend is responding correctly."
else
  echo "❌ Production backend test failed."
  docker-compose -f docker-compose.prod.yml logs
  docker-compose -f docker-compose.prod.yml down
  exit 1
fi

# Clean up production environment
echo "Shutting down prod containers..."
docker-compose -f docker-compose.prod.yml down

echo "✅ Production environment test passed!"

echo "\n🎉 All infrastructure tests passed successfully!"
