# SPECIFICATION: DEPLOYMENT_HOSTING

## 1. EXECUTIVE SUMMARY

- **Component Name:** `infra/deployment-hosting`
- **Folder Reference:** `docs/development/deployment_hosting`
- **Domain:** Production Cloud Infrastructure, Docker Containerization, Nginx Edge Gateway, CI/CD, and Hosting
- **Owner:** Platform DevOps & SRE Engineering Team
- **Purpose:** Provide automated containerization, reverse proxy routing, SSL termination, and continuous zero-downtime deployment pipelines for the entire Forginity monorepo platform on Hetzner Cloud infrastructure protected by Cloudflare.
- **Consumers:** All platform microservices (`services/*`) and frontend micro-apps (`apps/*`).
- **Development Roadmap:** [`./TASK_LIST.md`](./TASK_LIST.md)
- **Implementation Record:** [`./IMPLEMENTATIONS_RECORD.md`](./IMPLEMENTATIONS_RECORD.md)

---

## 2. BUSINESS & FUNCTIONAL REQUIREMENTS

### Core Capabilities
- **Multi-Stage Production Dockerfiles:** Lean Alpine-based Docker container images for Next.js applications and Node.js/Express backend microservices.
- **Production Docker Compose & Mesh:** Centralized `docker-compose.prod.yml` coordinating microservices, PostgreSQL, Redis, and internal network isolation.
- **Nginx Reverse Proxy Gateway:** High-performance reverse proxy routing traffic from Cloudflare Edge to frontends (`forginity.com`, `admin.forginity.com`) and APIs (`/api/*`).
- **Cloudflare Edge & Security Hardening:** Origin SSL certificates, Full (Strict) SSL, rate limiting rules, and DDoS shielding.
- **Automated CI/CD Pipeline:** GitHub Actions workflow executing type checks, linting, tests, container building, and SSH-based rolling container updates.

### Workflows
1. **Automated Production Deployment:**
   - Engineer pushes verified release tag to `main` branch.
   - GitHub Actions pipeline runs automated type checks and test suites across affected packages.
   - Pipeline builds and caches multi-stage Docker images.
   - Pipeline securely connects via SSH to Hetzner dedicated instances.
   - Rolling zero-downtime deployment restarts containers with health check validations.

---

## 3. ARCHITECTURE & TECH STACK

- **Hosting Provider:** Hetzner Cloud Dedicated Instances (Ubuntu 24.04 LTS).
- **Containerization:** Docker Engine & Docker Compose.
- **Edge Proxy:** Nginx with HTTP/2 and gzip/brotli compression.
- **DNS & CDN:** Cloudflare DNS, WAF, and SSL termination.
- **CI/CD:** GitHub Actions with Turborepo remote caching.
- **Architectural Reference:** [`docs/org/TDD.md`](file:///home/vikas/Documents/forginity/docs/org/TDD.md)

---

## 4. SECURITY & COMPLIANCE

- **Zero `.env` Access:** Production secrets are injected dynamically via GitHub Encrypted Secrets and environment files generated only at deploy time on the target host.
- **Container Non-Root Users:** All Dockerfiles run under unprivileged `node` users.
- **Internal Network Isolation:** Databases and Redis instances are never bound to public interfaces; communication occurs only over internal Docker bridge networks.
