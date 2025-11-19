#!/bin/bash
echo "Starting Expenso in Production Mode..."

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Starting Gunicorn server..."
gunicorn --bind 0.0.0.0:8000 --workers 3 expenso_backend.wsgi:application