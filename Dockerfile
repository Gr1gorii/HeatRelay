FROM node:24-alpine AS frontend-build

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci
COPY frontend ./frontend
RUN env -u OPENAI_API_KEY npm --prefix frontend run build

FROM python:3.10-slim AS python-production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY backend/requirements.txt backend/constraints-production.txt ./backend/
RUN python -m pip install --no-cache-dir \
    --requirement backend/requirements.txt \
    --constraint backend/constraints-production.txt

FROM python-production AS license-build

COPY LICENSE THIRD_PARTY_NOTICES.md ./
COPY scripts/build_third_party_license_bundle.py ./scripts/
COPY frontend/package-lock.json ./frontend/
COPY --from=frontend-build /build/frontend/node_modules ./frontend/node_modules
RUN python scripts/build_third_party_license_bundle.py \
    --root /app \
    --output /licenses/THIRD_PARTY_LICENSES.txt

FROM python-production AS runtime

LABEL org.opencontainers.image.source="https://github.com/Gr1gorii/HeatRelay" \
    org.opencontainers.image.description="HeatRelay multilingual heat-safety action plans for the Barcelona demo" \
    org.opencontainers.image.licenses="MIT"

COPY backend/app ./backend/app
COPY data ./data
COPY --from=frontend-build /build/frontend/dist ./frontend/dist
COPY LICENSE THIRD_PARTY_NOTICES.md /usr/share/licenses/heatrelay/
COPY --from=license-build /licenses/THIRD_PARTY_LICENSES.txt \
    /usr/share/licenses/heatrelay/THIRD_PARTY_LICENSES.txt

RUN addgroup --system heatrelay \
    && adduser --system --ingroup heatrelay heatrelay \
    && chown -R heatrelay:heatrelay /app
USER heatrelay

EXPOSE 8000
CMD ["python", "-m", "backend.app.production"]
