---
title: 'Deploy a Small App with Docker (Step-by-Step)'
date: '2026-01-28'
excerpt: 'A practical guide to containerizing a small app, running it locally, and deploying it on a server using Docker Compose.'
coverImage: "/images/posts/docker.jpg"
alt: "Docker whale logo on a blue background"
---

# Deploy a Small App with Docker (Step-by-Step)

Docker lets you package an app (code + runtime + dependencies) into a container so it runs the same way on your laptop and on a server. For small apps, the goal is simple: **build one image**, **run one container**, and **make upgrades predictable**.

This post walks through a clean, repeatable workflow:

- Create a `Dockerfile`
- Add a `.dockerignore`
- Build and run locally
- Pass environment variables safely
- Deploy with Docker Compose on a small VPS
- Update the app with minimal downtime

## What you need

- Docker installed (`docker version`)
- A small web app that listens on a port (examples below assume port `3000`)
- Optional: a Linux VPS (DigitalOcean/Linode/Hetzner/etc.) with SSH access

## 1) Make sure your app listens on 0.0.0.0

Inside a container, binding to `localhost` can make the app unreachable from outside the container. In most frameworks you want to listen on **0.0.0.0**.

Examples:

- Node/Express:
  - `app.listen(process.env.PORT ?? 3000, '0.0.0.0')`
- Next.js:
  - `next start -H 0.0.0.0 -p 3000`
- Python/Flask (dev server is not for production, but for local testing):
  - `flask run --host=0.0.0.0 --port=3000`

## 2) Add a `.dockerignore`

This keeps images smaller and builds faster by excluding files Docker doesn’t need.

Create `.dockerignore` in your project root (adjust for your stack):

```gitignore
node_modules
.next
dist
build
.git
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
```

## 3) Write a minimal `Dockerfile`

Below is a good default for a **small Node app** (Express, Fastify, etc.). It uses a multi-stage build so the final image contains only production dependencies.

Create `Dockerfile` in your project root:

```dockerfile
# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build (if your app has a build step)
COPY . .
# If you don't have a build step, you can remove this line.
RUN npm run build --if-present

# 2) Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed
COPY package*.json ./
RUN npm ci --omit=dev

# If you build to dist/, copy dist; otherwise copy your server entrypoint.
COPY --from=build /app/dist ./dist

# If your app doesn't produce dist/, replace the line above with:
# COPY --from=build /app ./

EXPOSE 3000

# Update this to match how your app starts
CMD ["node", "dist/server.js"]
```

Notes:

- If your app is **Next.js**, you’ll likely want `next build` and `next start` (or a standalone output). The idea is the same: build in one stage, run in a smaller final stage.
- If you’re **not** on Node, the pattern is still similar: keep the runtime image small, and don’t ship dev tooling to production.

## 4) Examples by framework (copy/paste)

Use these when you want a “known good” starting point. The main thing to keep consistent is: **the port you `EXPOSE` and the port your app actually listens on**.

### Next.js (recommended: standalone output)

If you’re deploying a Next.js app, a great pattern is building a standalone server.

1. Update `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

2. Use this `Dockerfile`:

```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Standalone server + static assets
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

Run it:

```bash
docker build -t my-next-app .
docker run --rm -p 3000:3000 my-next-app
```

### Express (simple production container)

Assuming you start with `node server.js` and your server binds to `0.0.0.0` and `process.env.PORT`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

Run it:

```bash
docker build -t my-express-app .
docker run --rm -p 3000:3000 my-express-app
```

### Python (FastAPI + Uvicorn)

Assuming `main.py` contains a FastAPI app called `app`:

```dockerfile
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000"]
```

Run it:

```bash
docker build -t my-fastapi-app .
docker run --rm -p 8000:8000 my-fastapi-app
```

### Go (tiny runtime image)

This builds a static binary and runs it in a minimal runtime image.

```dockerfile
# Build
FROM golang:1.22 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Runtime
FROM gcr.io/distroless/static-debian12
WORKDIR /
COPY --from=build /src/app /app
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

Run it:

```bash
docker build -t my-go-app .
docker run --rm -p 8080:8080 my-go-app
```

## 4) Build and run locally

From the project root:

```bash
docker build -t my-small-app:local .
docker run --rm -p 3000:3000 my-small-app:local
```

Then open `http://localhost:3000`.

## 5) Configure environment variables (without baking secrets into the image)

Don’t hardcode secrets in your `Dockerfile` or commit them to git.

Local run with env vars:

```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="..." \
  my-small-app:local
```

For longer lists, use an env file:

```bash
docker run --rm -p 3000:3000 --env-file .env.production my-small-app:local
```

## 6) Deploy on a small server with Docker Compose

On your VPS, create a folder like `/opt/my-small-app` and add a `docker-compose.yml`:

```yaml
services:
  app:
    image: my-small-app:latest
    container_name: my-small-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.production
```

Then add `.env.production` (on the server only):

```bash
mkdir -p /opt/my-small-app
cd /opt/my-small-app
nano .env.production
```

Start it:

```bash
docker compose up -d
docker compose logs -f
```

## 7) Updating the app (repeatable release flow)

Your update process should be boring:

- Build a new image
- Tag it
- Pull it on the server
- Restart via compose

If you’re using a registry (Docker Hub/GHCR):

```bash
# locally
docker build -t ghcr.io/YOUR_USER/my-small-app:1.0.0 .
docker push ghcr.io/YOUR_USER/my-small-app:1.0.0
docker tag ghcr.io/YOUR_USER/my-small-app:1.0.0 ghcr.io/YOUR_USER/my-small-app:latest
docker push ghcr.io/YOUR_USER/my-small-app:latest
```

On the server:

```bash
cd /opt/my-small-app
docker compose pull
docker compose up -d
```

## Common pitfalls (and quick fixes)

- **App works locally but not in Docker**: ensure you listen on `0.0.0.0` and expose/map the correct port.
- **Image is huge**: add `.dockerignore`, use multi-stage builds, avoid copying `node_modules`.
- **Secrets leaked**: never copy `.env` into the image; keep secrets in server env files or a secret manager.
- **Container keeps restarting**: check logs with `docker compose logs -f` and confirm your `CMD`/entrypoint path is correct.

## Deployment checklist

- [ ] App binds to `0.0.0.0`
- [ ] `.dockerignore` exists
- [ ] `Dockerfile` builds with `docker build .`
- [ ] Container runs with `docker run -p host:container`
- [ ] Secrets live outside the image (env vars / env_file)
- [ ] Compose uses `restart: unless-stopped`
- [ ] You can update via `compose pull && compose up -d`

