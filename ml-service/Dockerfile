# Dockerfile for TypingIQ FastAPI ML Service
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and pre-trained models
COPY app ./app

EXPOSE 8000

# Run FastAPI app with dynamic port binding for Render
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
