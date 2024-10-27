FROM python:3.13-slim-bookworm

# Install system dependencies and build tools first
# Clean up apt cache in the same layer to keep image size down
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

COPY . /app/

RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH" \
    DJANGO_SETTINGS_MODULE=chatgptserver.settings \
    PYTHONUNBUFFERED=1 \
    DEBUG=True \
    ALLOWED_HOSTS="localhost,127.0.0.1"

EXPOSE 8000

RUN python chatgptserver/manage.py migrate
CMD ["python", "chatgptserver/manage.py", "runserver", "0.0.0.0:8000"]
