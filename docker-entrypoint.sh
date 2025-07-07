#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
npx prisma db push --accept-data-loss || true

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec npm start 