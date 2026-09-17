# Full-Stack Social E-Commerce Platform V 1.0

> A production-ready, event-driven e-commerce ecosystem built with the PERN stack, featuring real-time social support, live streaming, RBAC, and containerized deployment.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]

## Key Features & Architecture Highlights

- 🐳 **Unified Docker Containerization**: Builds the React frontend and Node.js backend into one production image, serving the complete application under a single domain.
- 🛡️ **Single-Domain Multi-Role RBAC**: Clerk-backed authentication with role-aware experiences for admins, support staff, and customers.
- 💬 **Real-Time Chat & Live Streaming**: Stream Chat powers customer support conversations, while Stream Live enables live broadcasts.
- 🔔 **Asynchronous Payment & Auth Webhooks**: Clerk and Polar webhooks synchronize identity, payment, checkout, and order state with PostgreSQL.
- 🖼️ **Image Viewport Optimization**: ImageKit handles product media delivery and responsive image transformations for catalog and admin views.
- 📡 **Distributed Observability**: Sentry tracks frontend and backend errors, performance, user context, traces, and replay data.
- 🛒 **Event-Driven Commerce Workflows**: Product catalog, carts, checkout, order tracking, support, and administration are connected through API and webhook workflows.
- 📱 **Responsive User Experience**: Storefront, admin tools, product management, and mobile navigation adapt across desktop and small-screen devices.

## Tech Stack & Integrations

| Category | Technology / Service | Purpose |
| --- | --- | --- |
| Backend | Node.js | Runtime for API and webhook services |
| Backend | Express.js | HTTP API, middleware, routing, and static production hosting |
| Backend | TypeScript | Type-safe server development |
| Database & ORM | PostgreSQL | Primary relational data store |
| Database & ORM | Drizzle ORM | Schema definitions, queries, and database migrations |
| Frontend | React | Component-based user interface |
| Frontend | TypeScript | Type-safe application development and tooling |
| Frontend | TanStack Query | Server-state fetching, caching, and mutations |
| Frontend | Zustand | Lightweight client-side cart state |
| Frontend | Tailwind CSS | Utility-first responsive styling |
| Frontend | DaisyUI | Accessible component primitives and themes |
| Authentication & Roles | Clerk with Webhooks | Authentication, user synchronization, and role-aware access |
| Payments | Polar with Webhooks | Checkout and asynchronous payment/order events |
| Real-Time Services | Stream Chat | Customer support messaging |
| Real-Time Services | Stream Live | Live broadcasts and video experiences |
| Media Optimization | ImageKit | Image upload, delivery, and viewport-aware transformations |
| Observability | Sentry | End-to-end runtime, error, trace, and replay monitoring |
| Containerization & DevOps | Docker | Reproducible multi-stage production builds |
| Containerization & DevOps | Docker Compose | Local orchestration for the application stack |

## Architecture & System Workflow

The frontend communicates with the Express API through the same production domain. In a production Docker build, the backend serves the compiled React application as static assets and handles `/api` requests, reducing cross-origin configuration and deployment complexity.

Clerk webhooks receive user lifecycle events and synchronize Clerk identities, profile data, and roles into PostgreSQL. Polar webhooks receive asynchronous checkout and payment events, allowing the backend to update checkout and order state even when payment processing completes outside the browser request lifecycle.

The application uses role-aware middleware for protected administrative and support operations. Stream credentials are issued by the backend, while ImageKit upload authentication keeps private media configuration on the server.

Sentry monitors both runtime environments: `@sentry/react` captures frontend errors, traces, user context, and replay data, while `@sentry/node` instruments the Express server, webhooks, database-backed workflows, and API failures.

## Getting Started / Local Development Setup

### Prerequisites

- Node.js 22 or later
- npm
- Docker and Docker Compose for the recommended workflow
- A PostgreSQL database
- Accounts and credentials for Clerk, Polar, Stream, ImageKit, and Sentry as needed

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Configure environment variables

The repository includes placeholder files at `BackEnd/.env.example` and `FrontEnd/.env.example`. Copy them before adding local values:

```bash
cp BackEnd/.env.example BackEnd/.env
cp FrontEnd/.env.example FrontEnd/.env
```

#### Backend environment

Add the following variables to `BackEnd/.env`:

```dotenv
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce

CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
FRONT_END_URL=http://localhost:5173

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_API_BASE=https://api.polar.sh
POLAR_CHECKOUT_PRODUCT_ID=00000000-0000-0000-0000-000000000000

STREAM_API_KEY=...
STREAM_API_SECRET=...

IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

SENTRY_DSN=https://...
```

`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, and `SENTRY_DSN` are optional in the backend schema, but the Polar product ID and the other integration values required by the enabled features must be configured.

#### Frontend environment

Add the following Vite variables to `FrontEnd/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
VITE_SENTRY_DSN=https://...
```

Never commit real secrets. Keep private Clerk, Polar, Stream, ImageKit, database, and webhook credentials on the backend.

### 3. Run with Docker (recommended)

From the repository root:

```bash
docker-compose up --build
```

The production container listens on port `5000`:

```text
http://localhost:5000
```

The Dockerfile builds both applications and copies the frontend build into the backend's `public` directory. This repository currently contains the Dockerfile; ensure a compatible `docker-compose.yml` is present in the root when using the Compose command.

### 4. Alternative manual run

Install and start the backend:

```bash
cd BackEnd
npm install
npm run db:push
npm run dev
```

In a second terminal, install and start the frontend:

```bash
cd FrontEnd
npm install
npm run dev
```

The Vite development server is typically available at `http://localhost:5173`, and the backend runs at `http://localhost:5000`.

## Deployment Guide

Build and run the production container with Docker:

```bash
docker build \
	--build-arg VITE_CLERK_PUBLISHABLE_KEY="$VITE_CLERK_PUBLISHABLE_KEY" \
	-t social-ecommerce .

docker run --rm -p 5000:5000 --env-file BackEnd/.env social-ecommerce
```

For Railway, Render, or a VPS:

1. Create a PostgreSQL database and collect its connection URL.
2. Configure the backend environment variables in the platform's secret manager.
3. Configure the Docker service to build from the repository root using `Dockerfile`.
4. Pass the frontend Clerk publishable key as the `VITE_CLERK_PUBLISHABLE_KEY` Docker build argument.
5. Expose port `5000` and configure Clerk and Polar webhook URLs against the deployed domain.
6. Run database schema deployment with `npm run db:push` or the platform's release command before serving traffic.

The live demo was hosted on Railway. The entire stack is fully containerized and can be deployed to any Docker-compatible cloud platform.

## Project Roadmap (v2.0 Plan)

- 🏪 **Multi-Vendor Marketplace**: Transition from a single-store catalog to an Amazon-style marketplace with vendor-owned products and storefronts.
- 🔎 **Advanced Product Discovery**: Implement PostgreSQL full-text search and dynamic price range filtering.
- 📊 **Vendor Analytics Dashboards**: Add sales analytics, product performance metrics, and visual reporting with Recharts.

## Contributing & License

Contributions are welcome.

1. Fork the repository and create a focused feature branch.
2. Install dependencies and run the relevant frontend and backend checks locally.
3. Keep pull requests focused, describe the behavior change, and include screenshots or reproduction steps for UI changes.
4. Open a pull request with a clear summary and testing notes.

This project is released under the MIT License. Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the standard MIT License conditions.


