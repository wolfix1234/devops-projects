variable "kubeconfig_path" {
  type = string
}

variable "namespace" {
  type = string
}

variable "complex_image" {
  type = string
}

variable "complex_replicas" {
  type    = number
  default = 1
}

variable "complex_host" {
  type = string
}

variable "dashboard_image" {
  type = string
}

variable "dashboard_replicas" {
  type    = number
  default = 1
}

variable "dashboard_host" {
  type = string
}

variable "landing_image" {
  type = string
}

variable "landing_replicas" {
  type    = number
  default = 1
}

variable "landing_host" {
  type = string
}


variable "userwebsite_image" {
  type = string
}

variable "userwebsite_replicas" {
  type    = number
  default = 1
}

variable "userwebsite_host" {
  type = string
}