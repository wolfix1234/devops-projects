import client from 'prom-client';

// Metrics instances
const httpRequestsTotal = new client.Counter({
  name: 'dashboard_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'vendor_id']
});

const httpRequestDuration = new client.Histogram({
  name: 'dashboard_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'vendor_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const dbOperations = new client.Counter({
  name: 'dashboard_db_operations_total',
  help: 'Total database operations',
  labelNames: ['operation', 'collection', 'vendor_id']
});

// Helper functions
export const recordHttpRequest = (method: string, route: string, statusCode: number, duration: number, vendorId?: string) => {
  const labels = { method, route, status_code: statusCode.toString(), vendor_id: vendorId || 'unknown' };
  httpRequestsTotal.inc(labels);
  httpRequestDuration.observe(labels, duration);
};

export const recordDbOperation = (operation: string, collection: string, vendorId?: string) => {
  dbOperations.inc({ operation, collection, vendor_id: vendorId || 'unknown' });
};

export { httpRequestsTotal, httpRequestDuration, dbOperations };