variable "kubeconfig_path" {
  description = "Path to kubeconfig"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "name" {
  description = "App name (used for resources)"
  type        = string
}

variable "image" {
  description = "Container image (with tag)"
  type        = string
}

variable "replicas" {
  description = "Desired replicas"
  type        = number
  default     = 2
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 3000
}

variable "service_port" {
  description = "Service port (external)"
  type        = number
  default     = 80
}

variable "host" {
  description = "Ingress host for this app"
  type        = string
  default     = ""
}

variable "resources" {
  description = "map of resource requests/limits"
  type = object({
    requests = map(string)
    limits   = map(string)
  })
  default = {
    requests = { cpu = "500m", memory = "1000Mi", "ephemeral-storage" = "1Gi" }
    limits   = { cpu = "1000m", memory = "2000Mi", "ephemeral-storage" = "1Gi" }
  }
}

variable "hpa" {
  description = "HPA configuration"
  type = object({
    enabled            = bool
    min_replicas       = number
    max_replicas       = number
    cpu_utilization    = number
    memory_utilization = number
  })
  default = {
    enabled            = true
    min_replicas       = 2
    max_replicas       = 5
    cpu_utilization    = 70
    memory_utilization = 70
  }
}

variable "node_selector_key" {
  description = "nodeAffinity key"
  type        = string
  default     = "node-role.kubernetes.io/cloud-container-g2"
}

variable "node_selector_value" {
  description = "nodeAffinity value"
  type        = string
  default     = "true"
}
