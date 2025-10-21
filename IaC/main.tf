terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}


resource "kubernetes_namespace" "main" {
  metadata {
    name = var.namespace
  }
}


# Apps
module "complex" {
  source          = "./modules/app"
  kubeconfig_path = var.kubeconfig_path
  namespace = var.namespace
  name            = "complex"
  image           = var.complex_image
  replicas        = var.complex_replicas
  host            = var.complex_host
}

module "dashboard" {
  source          = "./modules/app"
  kubeconfig_path = var.kubeconfig_path
  namespace = var.namespace
  name            = "dashboard"
  image           = var.dashboard_image
  replicas        = var.dashboard_replicas
  host            = var.dashboard_host
}

module "landing" {
  source          = "./modules/app"
  kubeconfig_path = var.kubeconfig_path
  namespace = var.namespace
  name            = "landing"
  image           = var.landing_image
  replicas        = var.landing_replicas
  host            = var.landing_host
}

module "userwebsite" {
  source          = "./modules/app"
  kubeconfig_path = var.kubeconfig_path
  namespace = var.namespace
  name            = "userwebsite"
  image           = var.userwebsite_image
  replicas        = var.userwebsite_replicas
  host            = var.userwebsite_host
}
