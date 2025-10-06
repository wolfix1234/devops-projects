# Prometheus & Grafana Monitoring

This folder contains monitoring and metrics collection setup using Prometheus and Grafana for application observability.

## What's Inside

- **api-metrics.ts** - API endpoint for exposing metrics
- **login-count.ts** - User login tracking metrics
- **metrics-config.ts** - Prometheus metrics configuration
- **metrics.ts** - Core metrics definitions and helpers
- **sample-middleware.ts** - Middleware for automatic metrics collection

## Purpose

Implements comprehensive application monitoring with custom metrics for HTTP requests, database operations, user activities, and performance tracking.

## Key Features

- HTTP request metrics (duration, count, status codes)
- Database operation tracking
- User login analytics
- Custom middleware for automatic instrumentation
- Prometheus-compatible metrics export