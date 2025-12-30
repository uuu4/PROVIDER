#!/bin/sh

# Fail on error
set -e

echo "Starting deployment setup..."

# Check if .env exists, if not copy example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi

# Wait for DB to be ready
echo "Waiting for database..."
# Simple wait loop (in production use wait-for-it)
sleep 2

# Generate key if not set
if grep -q "APP_KEY=" .env && grep -q "APP_KEY=$" .env; then
    echo "Generating application key..."
    php artisan key:generate
fi

# Run migrations and Seed (force for production mode)
echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

# Cache config
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Setup complete. Starting PHP-FPM..."
php-fpm
