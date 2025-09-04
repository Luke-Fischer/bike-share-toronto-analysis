FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install Python deps first
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the app
COPY . .

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--app-dir", "src", "--host", "0.0.0.0", "--port", "8000", "--reload"]
