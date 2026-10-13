# ADR-05 · Deployment: Nginx 1.30 with TLS + systemd service

**Status:** accepted · **Findings:** H07 (production environment), H12

## Context
The original ran with `node server.js` over HTTP, directly exposed and without automatic restart. Institutional data cannot be stored in the public cloud.

## Considered alternatives
| Alternative | Advantages | Disadvantages |
| --- | --- | --- |
| Express directly on port 443 | No extra components | Node would have to handle TLS and run with privileges to use port 443 |
| **Nginx 1.30 (TLS) + systemd** | TLS 1.2/1.3, HSTS, rate limiting; automatic restart; Express only on `127.0.0.1` | One more component to configure |
| Docker + Kubernetes | Scaling and orchestration | Disproportionate for a monolith on one server |
| PaaS (Render, Railway) | No server administration | Institutional data outside the university infrastructure |

## Decision
Nginx as a TLS reverse proxy (`deploy/nginx.conf`) and the application as a hardened systemd service (`deploy/enrollment.service`) with its variables in `/etc/enrollment/enrollment.env`. With `NODE_ENV=production` the application **does not start** if the identity provider configuration is missing, and `/auth/dev-token` does not exist.

## Justification
Separating public traffic (Nginx) from the business process (Express) is the standard, simple way to serve a Node application with TLS on the institution's own servers, while remaining a monolith.

## Consequences
- ✅ Encrypted traffic, HSTS and a limit of 20 requests/s per IP on the API.
- ✅ systemd restarts the application if it fails and keeps the logs (`journalctl`).
- ⚠️ A single server: no high availability. To scale horizontally, more instances can be added behind Nginx (the application keeps no state in memory).
- ⚠️ Certificates must be renewed (certbot automates it).

**Evidence:** `deploy/nginx.conf`, `deploy/enrollment.service`, `deploy/enrollment.env.example` · test `H07 · in production it does not start without the identity provider (ADR-05)`.
