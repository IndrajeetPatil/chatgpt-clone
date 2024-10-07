# server/Dockerfile

FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy the project into the image
COPY . /app/

# Install dependncies
WORKDIR /app
RUN uv sync --frozen

# Expose the port the app runs on
EXPOSE 8000

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=chatgptserver.settings.production
ENV PYTHONUNBUFFERED=1

# Run the Django backend
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

