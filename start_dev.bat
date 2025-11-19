@echo off
echo Starting Expenso Development Server...
echo =====================================

call venv\Scripts\activate

echo Applying migrations...
python manage.py migrate

echo Populating sample data...
python manage.py populate_sample_data

echo Starting Django development server...
echo.
echo API Documentation available at:
echo   Swagger UI: http://127.0.0.1:8000/swagger/
echo   ReDoc: http://127.0.0.1:8000/redoc/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver