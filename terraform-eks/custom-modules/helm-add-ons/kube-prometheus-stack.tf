resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "86.1.1"

  namespace        = "monitoring"
  create_namespace = true

  set = [
    {
      name  = "grafana.service.type"
      value = "LoadBalancer"
    }
  ]
}