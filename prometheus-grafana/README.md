# Prometheus Monitoring

Application observability with custom metrics for HTTP requests, DB operations, and user analytics.

## Stack
- Prometheus + Grafana
- Custom metrics middleware
- HTTP/DB/user tracking

## Key Files
- `metrics.ts` - Core metrics definitions
- `sample-middleware.ts` - Auto instrumentation
- `api-metrics.ts` - Metrics export endpoint
- `login-count.ts` - User analytics