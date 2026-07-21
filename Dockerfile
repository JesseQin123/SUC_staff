# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS frontend-build

WORKDIR /build/frontend-enterprise
COPY frontend-enterprise/package.json frontend-enterprise/package-lock.json ./
RUN npm ci
COPY frontend-enterprise/ ./
RUN npm run build


FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    APP_NAME=DayDayUp \
    DATABASE_URL=sqlite:////data/skill_agent_loop.db \
    ULTRARAG_DATA_DIR=/data \
    GENERAL_SKILL_RUNTIME_PYTHON=/usr/local/bin/python \
    GENERAL_SKILL_RUNTIME_AUTO_INSTALL=false

WORKDIR /app

COPY backend/ /app/backend/
RUN chmod -R a+rX /app/backend \
    && pip install --no-cache-dir /app/backend

COPY --from=frontend-build /build/frontend-enterprise/dist/ /app/frontend-enterprise/dist/

RUN groupadd --system --gid 10001 daydayup \
    && useradd --system --uid 10001 --gid daydayup --home-dir /data --shell /usr/sbin/nologin daydayup \
    && mkdir -p /data \
    && chown -R daydayup:daydayup /data

WORKDIR /app/backend
USER daydayup

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["python", "-c", "import json, urllib.request; data=json.load(urllib.request.urlopen('http://127.0.0.1:5173/api/health', timeout=3)); assert data == {'status': 'ok', 'app': 'DayDayUp'}"]

CMD ["uvicorn", "single_port_app:app", "--host", "0.0.0.0", "--port", "5173", "--proxy-headers", "--forwarded-allow-ips", "*"]
