# ==========================================
# STAGE 1: Builder
# ==========================================
FROM python:3.8-slim AS builder

WORKDIR /app

# Prevent Python from writing .pyc files & buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install required system dependencies for building C-extensions (like psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies to local wheels cache
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


# ==========================================
# STAGE 2: Runner (Production)
# ==========================================
FROM python:3.8-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install only the runtime postgres dependency without heavy build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security best-practices
RUN groupadd -r django && useradd -r -g django django

# Copy built wheels from builder stage and install
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy backend source code
COPY . .

# Adjust permissions for the non-root user
RUN chown -R django:django /app

# Switch to non-root user
USER django

# Expose standard port (Render will override the PORT environment variable natively)
EXPOSE 8000

# Gunicorn production entrypoint
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
