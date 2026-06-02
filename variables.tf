variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "cluster_name" {
  type    = string
  default = "eks-amandhal"
}

variable "vpc_name" {
  type    = string
  default = "vpc-amandhal"
}

variable "vpc_cidr" {
  type    = string
  default = "10.10.0.0/16"
}

variable "azs" {
  type = list(string)

  default = [
    "ap-south-1a",
    "ap-south-1b"
  ]
}

variable "private_subnets" {
  type = list(string)

  default = [
    "10.10.1.0/24",
    "10.10.2.0/24"
  ]
}

variable "public_subnets" {
  type = list(string)

  default = [
    "10.10.101.0/24",
    "10.10.102.0/24"
  ]
}