resource "helm_release" "elasticsearch" {
  name       = "elasticsearch"
  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"

  namespace        = "logging"
  create_namespace = true

  set = [
    {
      name  = "replicas"
      value = 1
    },
    {
      name  = "persistence.enabled"
      value = false
    },
  ]
}

resource "helm_release" "kibana" {
  name       = "kibana"
  repository = "https://helm.elastic.co"
  chart      = "kibana"

  namespace        = "logging"
  create_namespace = true

  set = [
    {
      name  = "service.type"
      value = "LoadBalancer"
    }
  ]
  depends_on = [
    helm_release.elasticsearch
  ]
}
