resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  version    = "9.57.0"
  namespace  = "kube-system"
  set = [
    {
      name  = "autoDiscovery.clusterName"
      value = module.eks.cluster_name
    },
    {
      name  = "awsRegion"
      value = var.aws_region
    },
    {
      name  = "rbac.serviceAccount.create"
      value = "true"
    },
    {
      name  = "rbac.serviceAccount.name"
      value = "cluster-autoscaler"
    }
  ]

  depends_on = [module.eks]
}


resource "helm_release" "nginx_ingress_controller" {
  name       = "nginx-ingress-controller"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.15.1"

  namespace        = "ingress-nginx"
  create_namespace = true

  set = [
    {
      name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
      value = "nlb"
    }
  ]

  depends_on = [module.eks]
}