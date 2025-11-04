# VPS Deployment - Real Estate Platform

Production deployment for Next.js real estate platform with zero-downtime CI/CD.

**Live:** oujamlak.ir

## Stack
- Next.js app + Chat service + Nginx proxy
- Docker multi-container setup
- GitHub Actions → SSH deployment
- Automatic rollback on failure

## Key Files
- `deploy.sh` - Deployment script with rollback
- `docker-compose.yml` - Multi-service orchestration  
- `nginx.conf` - Cloudflare-integrated proxy
- `.github/workflows/` - CI/CD pipeline
