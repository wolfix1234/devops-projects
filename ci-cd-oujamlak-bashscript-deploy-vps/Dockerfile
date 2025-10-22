# Use the official Node.js 18 Alpine image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create app user & group
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Make sure /app is writable by the app user
RUN mkdir -p /app/temp \
  && mkdir -p /app/public/uploads/posters \
  && mkdir -p /app/public/uploads/blog \
  && mkdir -p /app/public/uploads/consultants \
  && mkdir -p /app/public/uploads/videos \
  && chown -R nextjs:nodejs /app

# Copy build output with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Install su-exec for privilege drop
RUN apk add --no-cache su-exec

# Entry point
RUN echo '#!/bin/sh' > /entrypoint.sh \
  && echo 'exec su-exec nextjs "$@"' >> /entrypoint.sh \
  && chmod +x /entrypoint.sh

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
