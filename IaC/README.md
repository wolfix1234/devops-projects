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
- `env/` - Environment configs (gitignored)
- `main.tf` - Root configuration

## Security
- ✅ `.gitignore` prevents sensitive files from being committed
- ✅ State files and `.tfvars` are excluded from version control
- ✅ Example templates provided for environment setup

## Setup
```bash
# Copy and configure environment
cp env/dev.tfvars.example env/dev.tfvars
# Edit with your actual values

# Deploy
terraform workspace select dev
terraform apply -var-file=env/dev.tfvars
```