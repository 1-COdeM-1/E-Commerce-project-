# --- Stage 1: build the SPA ---
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY FrontEnd/ ./
ENV VITE_API_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm install --no-audit --no-fund \
  && npm run build

# --- Stage 2: compile the API ---
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY BackEnd/ ./
RUN npm install --no-audit --no-fund \
  && npm run build

# --- Stage 3: runtime ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY BackEnd/package.json BackEnd/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]