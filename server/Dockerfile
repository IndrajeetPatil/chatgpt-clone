FROM python:3.12-slim-bookworm
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy the project files
# (remember that Dockerfile is in the server directory)
COPY . /app/

# Install dependncies
RUN uv sync --frozen
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8000

# Set environment variables for Django
ENV DJANGO_SETTINGS_MODULE=chatgptserver.settings
ENV PYTHONUNBUFFERED=1
ENV DEBUG=True
ENV ALLOWED_HOSTS=localhost,127.0.0.1

# Run the Django backend
RUN python chatgptserver/manage.py migrate
CMD ["python", "chatgptserver/manage.py", "runserver", "0.0.0.0:8000"]
