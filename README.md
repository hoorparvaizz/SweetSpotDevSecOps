# SweetSpot – Artisan Dessert Marketplace 🍰

**A MERN-stack web application with a full DevSecOps-integrated CI/CD pipeline, containerized microservices, secure secrets management, automated testing, and real-time monitoring.**

---

## Overview
SweetSpot is a marketplace platform for artisan desserts, designed and developed with **DevSecOps principles** at its core.  
It features:
- A responsive, dynamic frontend for customers & vendors
- A secure, scalable backend API
- Automated CI/CD workflows
- Containerized deployments
- Integrated security scanning and monitoring

This project showcases **end-to-end software delivery automation** using industry-standard tools and practices.

---

## Tech Stack

### **Frontend**
- React.js + Tailwind CSS
- Axios for API communication
- React Router for navigation

### **Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT authentication + bcrypt password hashing

### **DevSecOps Toolchain**
| Category             | Tools Used |
|----------------------|------------|
| Version Control      | Git + GitHub |
| CI/CD                | GitHub Actions, CircleCI |
| Code Quality         | Codacy, ESLint |
| Containerization     | Docker, Docker Compose |
| Infrastructure as Code | Terraform |
| Secrets Management   | Doppler |
| API Testing          | Postman + Newman |
| Monitoring           | Prometheus, Grafana, Node Exporter |

---

## CI/CD Pipeline Highlights
- **Automated Linting & Testing:** ESLint + Jest + Postman API tests
- **Static Code Analysis:** Codacy for vulnerabilities, code smells, and maintainability checks
- **Containerization:** Dockerized frontend, backend, database, and monitoring stack
- **Secrets Management:** Doppler for runtime injection of environment variables
- **Monitoring & Observability:** Prometheus scrapes metrics, Grafana visualizes live dashboards

**Pipeline Flow:**
1. Code pushed to GitHub → triggers CI
2. Linting, static analysis, and automated tests run
3. Docker images are built
4. Deployment to containerized environment
5. Monitoring via Prometheus & Grafana

---

## Security Practices
- JWT-based authentication with role-based access control
- Encrypted password storage (bcrypt)
- Centralized, access-controlled secrets with Doppler
- Continuous security scanning during CI
- Minimal Docker base images to reduce attack surface

---

## Monitoring & Observability
- **Prometheus** scrapes backend metrics (`/metrics` endpoint)
- **Grafana** dashboards display:
  - API response times
  - Memory & CPU usage
  - Container uptime
- **Node Exporter** collects system-level metrics

---

## Showcase

Below are key visuals from the project:

- **CI/CD Pipeline in GitHub Actions** – automated linting, testing, and deployments  
- **Doppler Secrets Management** – secure, centralized environment variables  
- **Prometheus & Grafana Dashboards** – real-time performance metrics  
- **Frontend UI** – vendor dashboard, product listings, cart & checkout flow  
📷 [See full project screenshots](docs/full-gallery.md)

---

## Key Features Delivered
- **Frontend (Hoor Parvaiz):** Vendor & customer dashboards, API integration, CI workflows, Postman testing, Doppler integration
- **Backend (Ishika Mohol):** REST APIs, Docker orchestration, monitoring setup, Terraform deployment, Codacy integration
- **Joint Contributions:** CRUD APIs, authentication system, Prometheus metrics, container orchestration

---

## Future Enhancements
- Kubernetes orchestration for scaling
- ELK stack for centralized logging
- Cloud deployment via AWS/GCP
- Advanced security testing with OWASP ZAP

---

## References
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [CircleCI Docs](https://circleci.com/docs)
- [Docker Docs](https://docs.docker.com)
- [Doppler Docs](https://docs.doppler.com)
- [Prometheus Docs](https://prometheus.io/docs)
- [Grafana Docs](https://grafana.com/docs)

---

**Developed By:**  
- **Ishika Mohol** – Backend, Infrastructure, Monitoring  
- **Hoor Parvaiz** – Frontend, CI/CD, API Testing, Secrets Management
