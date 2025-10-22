# Infrastructure as Code (Terraform)

Multi-environment Kubernetes infrastructure with reusable modules and auto-scaling.

## Stack
- Terraform + Kubernetes provider
- Multi-workspace (dev/staging/prod)
- HPA + rolling updates + ingress

## Applications
- Complex, Dashboard, Landing, Userwebsite

## Key Files
- `modules/app/` - Reusable K8s module
- `env/` - Environment configs
- `main.tf` - Root configuration

## Usage
```bash
terraform workspace select dev
terraform apply -var-file=env/dev.tfvars
```