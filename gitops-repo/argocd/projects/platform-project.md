# Platform Project - ArgoCD Configuration

## Overview
This ArgoCD AppProject creates security boundaries and governance for platform applications.

## Request Flow
1. **kubectl apply** → **API Server** (control plane)
2. **API Server** → **etcd** (stores AppProject resource)
3. **ArgoCD Controller** (argocd namespace) → **watches API Server**
4. **ArgoCD Controller** → **updates internal project config**

## What Gets Affected

### ArgoCD Components
- **argocd-application-controller**: Reads new project rules
- **argocd-server**: Updates UI permissions and API access
- **argocd-repo-server**: No direct impact

### Storage
- Creates `AppProject` resource in `argocd` namespace
- ArgoCD stores project config in internal database

## Impact on ArgoCD
- **No restart required** - hot-reloads project changes
- **Immediate effect** on new Application deployments
- **Existing Applications** must reference this project
- **UI changes** - project appears in ArgoCD dashboard

## What It Doesn't Affect
- ArgoCD pods don't restart
- Existing applications continue running
- No impact on workload namespaces until applications use this project

## Configuration Details

### Source Repositories
- `https://github.com/wolfixor/gitops-repo`

### Target Environments
- `dev` namespace
- `staging` namespace  
- `production` namespace

### Allowed Resources
**Cluster-level:**
- Namespace
- Ingress
- NetworkPolicy

**Namespace-level:**
- Service, ConfigMap, Secret
- Deployment, ReplicaSet, Pod
- HorizontalPodAutoscaler

### Access Control
**Admin Role (platform-admins):**
- Full control over platform applications
- Repository access

**Developer Role (platform-developers):**
- View and sync dev environment apps only

## Usage
Applications must reference `project: platform` in their spec to use these rules.