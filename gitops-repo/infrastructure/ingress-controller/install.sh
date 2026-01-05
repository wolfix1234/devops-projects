#!/bin/bash

# Install NGINX Ingress Controller
echo "Installing NGINX Ingress Controller..."

# Apply the official NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for the deployment
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Apply custom service with your cloud provider annotations
kubectl apply -f nginx-ingress.yaml

echo "NGINX Ingress Controller installed successfully!"
echo "Getting LoadBalancer IP..."
kubectl get svc ingress-nginx-controller -n ingress-nginx