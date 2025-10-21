output "deployment_name" {
  value = kubernetes_deployment.app.metadata[0].name
}

output "service_name" {
  value = kubernetes_service.app.metadata[0].name
}

output "ingress_host" {
  value = length(kubernetes_ingress_v1.app) > 0 ? kubernetes_ingress_v1.app[0].spec[0].rule[0].host : ""
}
