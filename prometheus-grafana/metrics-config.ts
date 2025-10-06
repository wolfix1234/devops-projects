import client from 'prom-client';

// Create a single register instance
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'dashboard_' });

// Create metrics
export const vendorLogins = new client.Counter({
  name: 'dashboard_vendor_logins_total',
  help: 'Total vendor logins',
  labelNames: ['vendor_id'],
  registers: [register]
});

export const productsCreated = new client.Counter({
  name: 'dashboard_products_created_total',
  help: 'Total products created',
  labelNames: ['vendor_id', 'category'],
  registers: [register]
});

export const ordersReceived = new client.Counter({
  name: 'dashboard_orders_received_total',
  help: 'Total orders received',
  labelNames: ['vendor_id'],
  registers: [register]
});

export const apiRequests = new client.Counter({
  name: 'dashboard_api_requests_total',
  help: 'Total API requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register]
});

export const activeVendors = new client.Gauge({
  name: 'dashboard_active_vendors',
  help: 'Currently active vendors',
  registers: [register]
});

// Helper function to track API calls
export const trackApiCall = (method: string, endpoint: string, status: number) => {
  apiRequests.inc({ method, endpoint, status: status.toString() });
};

// Export the custom register for metrics endpoint
export { register as client };