FROM node:24-alpine AS frontend-build

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci
COPY frontend ./frontend
RUN env -u OPENAI_API_KEY npm --prefix frontend run build

FROM python:3.10-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY backend/requirements.txt backend/constraints-production.txt ./backend/
RUN python -m pip install --no-cache-dir \
    --requirement backend/requirements.txt \
    --constraint backend/constraints-production.txt

COPY backend/app ./backend/app
COPY data ./data
COPY --from=frontend-build /build/frontend/dist ./frontend/dist

RUN addgroup --system heatrelay \
    && adduser --system --ingroup heatrelay heatrelay \
    && chown -R heatrelay:heatrelay /app
USER heatrelay

EXPOSE 8000
CMD ["python", "-m", "backend.app.production"]
