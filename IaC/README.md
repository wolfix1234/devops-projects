# Infrastructure as Code (Terraform)

This folder contains Terraform infrastructure code for managing Kubernetes deployments across multiple environments.

## What's Inside

- **main.tf** - Root Terraform configuration with provider setup and module calls
- **variables.tf** - Variable definitions for all deployments
- **modules/app/** - Reusable Terraform module for Kubernetes applications
- **env/** - Environment-specific variable files (dev, staging, prod)
- **.terraform/** - Terraform state and provider binaries
- **terraform.tfstate.d/** - Workspace-specific state files

## Purpose

Manages multi-environment Kubernetes infrastructure using Terraform workspaces, deploying containerized Next.js applications with proper resource management, auto-scaling, and ingress configuration.

## Key Features

- **Multi-environment support** (dev/staging/prod workspaces)
- **Reusable app module** with deployment, service, ingress, and HPA
- **Rolling update strategy** with zero-downtime deployments
- **Horizontal Pod Autoscaler** with CPU/memory metrics
- **Node affinity and tolerations** for proper scheduling
- **Environment-specific configurations** via tfvars files

## Applications Managed

- **Complex** - Main application service
- **Dashboard** - Admin dashboard interface  
- **Landing** - Marketing landing page
- **Userwebsite** - User-facing website

## Quick Start

```bash
# Initialize Terraform
terraform init

# Create workspaces
terraform workspace new dev
terraform workspace new staging  
terraform workspace new prod

# Deploy to development
terraform workspace select dev
terraform apply -var-file=env/dev.tfvars
```