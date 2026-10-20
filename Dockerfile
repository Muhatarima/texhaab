FROM python:3.11-slim

# Set up a non-root user (Hugging Face Spaces runs as UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Install dependencies first for fast layer caching
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application files
COPY --chown=user api/ ./api/
COPY --chown=user ml/ ./ml/
COPY --chown=user pipeline/ ./pipeline/

# Hugging Face Spaces expects port 7860; Render passes PORT dynamically
EXPOSE 7860
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
