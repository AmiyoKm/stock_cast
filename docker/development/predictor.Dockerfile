# predictor/Dockerfile

# --- Build Stage ---
FROM python:3.11-slim AS builder

WORKDIR /app

COPY predictor/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Final Stage ---
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

COPY predictor/api/ ./api
COPY predictor/artifacts_unified/ ./artifacts_unified

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
