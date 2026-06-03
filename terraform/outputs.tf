output "update_kube_config" {
  description = "AWS CLI command to update kubeconfig for this EKS cluster."
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}