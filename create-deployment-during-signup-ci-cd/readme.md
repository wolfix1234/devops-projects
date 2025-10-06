# Dynamic Deployment Creation During Signup

This folder contains implementation for automatically creating Kubernetes deployments when users sign up, with complete CI/CD pipeline.

## What's Inside

- **.github/workflows/** - GitHub Actions for GitLab mirroring
- **k8s/** - Kubernetes manifests (deployment, ingress, secrets, testing)
- **.gitlab-ci.yml** - GitLab CI/CD pipeline
- **createDeployment.ts** - Core deployment creation logic
- **deployment-creator.yaml** - Kubernetes deployment template
- **Dockerfile** - Container configuration
- **signup.tsx** - Signup component with deployment trigger

## Purpose

Automatically provisions isolated Kubernetes deployments for each new user signup, enabling multi-tenant architecture with dedicated resources per user.

## Key Features

- Dynamic Kubernetes deployment creation
- User-specific resource provisioning
- Automated CI/CD pipeline
- Secret management for deployments
- Multi-tenant architecture support
- Signup flow integration
