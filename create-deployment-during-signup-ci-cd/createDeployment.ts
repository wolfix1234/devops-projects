import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

interface DeploymentConfig {
  name: string;
  image: string;
  replicas?: number;    // Optional: likely unused with HPA
  namespace?: string;
  storeId?: string;
}

const ARVAN_API_BASE = 'https://napi.arvancloud.ir/caas/v2/zones/ir-thr-ba1';

export async function createDeployment(config: DeploymentConfig): Promise<{
  message: string;
  config?: { host: string };
}> {
  const namespace = config.namespace || 'mamad';

  // Validate required fields
  if (!config.name || !config.image) {
    return { message: 'Name and image are required fields' };
  }

  // Read YAML template
  const yamlPath = path.join(process.cwd(), 'public/mamad.yaml');
  let yamlContent = fs.readFileSync(yamlPath, 'utf8');

  // Replace placeholders in the template:
  // - Deployment name
  // - Image name
  // - Remove replicas replacement since autoscaling is in place
  // - Update host URLs and ingress names using name and storeId
  yamlContent = yamlContent
    .replace(/{name-of-the-deployment}/g, config.name)
    .replace(/username\/image:version/g, config.image)
    // .replace(/replicas: 2/g, `replicas: ${config.replicas || 2}`) // omit this, replicas managed by HPA
    .replace(
      /{name-of-the-deployment}-5aab14d2ac-complex.apps.ir-central1.arvancaas.ir/g,
      `${config.name}-9ddcd5133c-mamad.apps.ir-central1.arvancaas.ir`
    )
    .replace(/name-of-the-deployment-free-ingress/g, `${config.name}-ingress`)
    .replace(/secret-{name-of-the-deployment}/g, `secret-${config.name}`);

  // Parse the modified YAML into separate documents
  const documents = yaml.loadAll(yamlContent) as any[];
  const errors = [];

  for (const doc of documents) {
    try {
      let endpoint = '';

      // Inject storeId into Secret data (base64 encoded)
      if (doc.kind === 'Secret' && doc.metadata.name !== 'shared-secret') {
        doc.data = doc.data || {};
        if (config.storeId) {
          doc.data.STOREID = Buffer.from(config.storeId).toString('base64');
        }
      }

      // Map kind to Arvan API endpoints with your namespace
      switch (doc.kind) {
        case 'Deployment':
          endpoint = `${ARVAN_API_BASE}/apis/apps/v1/namespaces/${namespace}/deployments`;
          break;
        case 'Service':
          endpoint = `${ARVAN_API_BASE}/api/v1/namespaces/${namespace}/services`;
          break;
        case 'Ingress':
          endpoint = `${ARVAN_API_BASE}/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;
          break;
        case 'Secret':
          endpoint = `${ARVAN_API_BASE}/api/v1/namespaces/${namespace}/secrets`;
          break;
        default:
          continue;
      }

      // POST each resource to Arvan API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ARVAN_API_TOKEN}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(doc),
      });

      if (!response.ok) {
        const errorText = await response.text();
        errors.push({ resource: doc.kind, error: errorText, status: response.status });
        console.error(`Error creating ${doc.kind}:`, errorText);
        continue;
      }

      const result = await response.json();
      console.log(`${doc.kind} created:`, result);
    } catch (error) {
      console.error(`Error processing ${doc.kind}:`, error);
      errors.push({
        resource: doc.kind,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    message: errors.length > 0
      ? 'Some resources were not created successfully'
      : 'All resources created successfully',
    config: {
      // Updated host URL to match new naming & namespace ("mamad") and storeId
      host: `${config.name}-9ddcd5133c-mamad.apps.ir-central1.arvancaas.ir`,
    },
  };
}
