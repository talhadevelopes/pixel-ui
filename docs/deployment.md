# Deployment

---

## Services

| Service | Platform |
| :--- | :--- |
| Frontend | Vercel |
| Backend | Fly.io |
| Database | Neon serverless PostgreSQL |
| Images | ImageKit |

---

## Docker

Run the full stack locally with Docker Compose:

```bash
docker-compose up -d
```

Build and run containers individually:

```bash
# Backend
docker build -t pixel-ui-server -f packages/server/Dockerfile .
docker run -p 4000:4000 --env-file packages/server/.env pixel-ui-server

# Frontend
docker build -t pixel-ui-client -f apps/web/Dockerfile .
docker run -p 3000:3000 pixel-ui-client
```

---

## CI/CD

GitHub Actions triggers on every push to master. It builds a Docker image for the backend from `packages/server/Dockerfile` and a Docker image for the frontend from `apps/web/Dockerfile`, then pushes both to Docker Hub under `talhadevelopes/pixel-ui-server` and `talhadevelopes/pixel-ui-client`. Fly.io pulls the backend image on deploy. Vercel handles frontend deployments automatically on push with no additional configuration.

---

## Environment Variables

Production environment variables are configured in the Vercel dashboard for the frontend and the Fly.io dashboard for the backend. Nothing is committed to the repository. Use the variable names listed in [frontend.md](frontend.md) and [backend.md](backend.md) as reference.