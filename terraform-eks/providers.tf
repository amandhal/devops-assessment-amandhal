terraform {
  backend "s3" {
    bucket       = "tfstate-amandhal"
    key          = "devops-assessment/terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.47.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "3.2.0"
    }
  }
}


provider "aws" {
  region = var.aws_region
}


provider "helm" {
  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["--region", var.aws_region, "eks", "get-token", "--cluster-name", var.cluster_name]
    }
  }
}
