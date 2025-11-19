# Deployment Guide

## Free Deployment Options

### 1. Railway (Recommended)
- **Cost**: Free tier available
- **Database**: PostgreSQL included
- **Steps**:
  1. Push code to GitHub
  2. Connect Railway to your GitHub repo
  3. Add environment variables
  4. Deploy automatically

### 2. Render
- **Cost**: Free tier available
- **Database**: PostgreSQL available
- **Steps**:
  1. Push code to GitHub
  2. Create new Web Service on Render
  3. Connect to GitHub repo
  4. Add environment variables

### 3. Heroku
- **Cost**: Free tier discontinued, paid plans available
- **Database**: PostgreSQL add-on available

## Environment Variables for Production

```
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:password@host:port/database
```

## Database Migration for Production

For PostgreSQL deployment, update `requirements.txt`:
```
psycopg2-binary==2.9.7
```

Update `settings.py` for production database:
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
```

## Static Files for Production

Add to `settings.py`:
```python
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

Add to `requirements.txt`:
```
whitenoise==6.5.0
```

## Security Settings for Production

Add to `settings.py`:
```python
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```