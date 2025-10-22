# Dynamic K8s Deployment on Signup

Auto-creates isolated Kubernetes deployments for each user signup (multi-tenant SaaS).

## Stack
- Next.js signup flow → K8s API
- Dynamic resource provisioning
- GitHub Actions → GitLab CI/CD

## Key Files
- `createDeployment.ts` - K8s deployment logic
- `signup.tsx` - Signup with deployment trigger
- `k8s/` - Deployment templates
- `deployment-creator.yaml` - K8s manifest template
