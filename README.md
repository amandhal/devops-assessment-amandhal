# EKS Observability & CI/CD DevOps Platform

## Table of Contents

* [Project Overview](#project-overview)

  * [Key Components](#key-components)

    * [Infrastructure (Terraform)](#infrastructure-terraform)
    * [IAM & Pod Identity](#iam--pod-identity)
    * [Application](#application)
* [Kubernetes Deployment](#kubernetes-deployment)

  * [Workload Resources](#workload-resources)
  * [Reliability Features](#reliability-features)
  * [Scaling Features](#scaling-features)
  * [Operations Features](#operations-features)
* [Monitoring Stack](#monitoring-stack)

  * [Prometheus](#prometheus)
  * [Grafana Dashboards](#grafana-dashboards)
* [Logging Stack (EFK)](#logging-stack-efk)

  * [Log Collection Flow](#log-collection-flow)
  * [Kibana Dashboards](#kibana-dashboards)
* [CI/CD Pipeline](#cicd-pipeline)

  * [CI Pipeline](#ci-pipeline)
  * [CD Pipeline](#cd-pipeline)
* [Terraform Deployment](#terraform-deployment)

  * [Prerequisites](#prerequisites)
  * [Remote State Setup](#remote-state-setup)
  * [Deploy Infrastructure](#deploy-infrastructure)
* [Application Deployment](#application-deployment)
* [Architecture Overview](#architecture-overview)
* [Challenges & Solutions](#challenges--solutions)

  * [CloudDrove IAM Module Compatibility Issue](#1-clouddrove-iam-module-compatibility-issue)
  * [Cluster Autoscaler Permission Issue](#2-cluster-autoscaler-permission-issue)
* [Future Improvements](#future-improvements)

  * [Enable HTTPS Using cert-manager](#enable-https-using-cert-manager)
  * [Additional Enhancements](#additional-enhancements)
* [Technologies Used](#technologies-used)

  * [Cloud & Infrastructure](#cloud--infrastructure)
  * [Containerization](#containerization)
  * [Kubernetes](#kubernetes)
  * [Monitoring](#monitoring)
  * [Logging](#logging)
  * [CI/CD](#cicd)
  * [Application](#application-1)
* [References](#references)

---

## Project Overview

This project demonstrates the deployment of a Node.js application on Amazon EKS using Infrastructure as Code, automated CI/CD pipelines, monitoring, logging, and autoscaling capabilities.

The infrastructure is provisioned using Terraform and deployed on AWS EKS. The application is packaged and deployed through a custom Helm chart and continuously delivered using GitHub Actions.

### Key Components

#### Infrastructure (Terraform)

The EKS infrastructure is created using the official Terraform AWS modules:

* AWS EKS Terraform Module
* AWS VPC Terraform Module

These modules automatically provision:

* VPC
* Public and Private Subnets
* Route Tables
* NAT Gateway
* Security Groups
* EKS Control Plane
* Managed Node Groups

Additionally, a custom Terraform module was created to deploy operational tooling directly into the cluster using the Terraform Helm Provider:

* Cluster Autoscaler
* Prometheus
* Grafana
* EFK Stack (Elasticsearch, Fluent Bit, Kibana)

#### IAM & Pod Identity

To securely grant AWS permissions to Kubernetes workloads:

* CloudDrove's IAM Role Terraform Module was used to create IAM roles.
* Required AWS IAM policies were attached to the roles.
* `aws_eks_pod_identity_association` resources were used to associate IAM roles with Kubernetes Service Accounts.
* Cluster Autoscaler receives permissions through Pod Identity rather than static AWS credentials.

#### Application

A custom Node.js application was developed with:

* `/health` endpoint for health checks
* `/metrics` endpoint for Prometheus metrics scraping
* Structured JSON logging
* Request tracking and metrics collection

The application was containerized using Docker and published to Docker Hub.

---

## Kubernetes Deployment

The application is deployed through a custom Helm chart that includes:

### Workload Resources

* Deployments
* Services
* ConfigMaps
* Secrets

### Reliability Features

* Resource Requests & Limits
* Liveness Probes
* Readiness Probes
* Rolling Updates

### Scaling Features

* Horizontal Pod Autoscaler (HPA)
* Cluster Autoscaler integration

### Operations Features

* NGINX Ingress Controller
* API Health Check CronJob
* Prometheus ServiceMonitor

The ServiceMonitor automatically allows Prometheus Operator to discover and scrape application metrics after deployment.

---

## Monitoring Stack

### Prometheus

Used for:

* Application metrics collection
* Kubernetes metrics collection
* Node metrics collection

### Grafana Dashboards

Custom dashboards were created for:

* Pod CPU Usage
* Pod Memory Usage
* Node CPU Usage
* Node Memory Usage
* API Request Count
* API Latency

<img width="1916" height="585" alt="Screenshot 2026-06-04 183914" src="https://github.com/user-attachments/assets/91dc0f80-bb9a-44ca-a340-311c2a0ef369" />
<img width="1919" height="595" alt="Screenshot 2026-06-04 184020" src="https://github.com/user-attachments/assets/2ba3b935-7896-493b-8308-8b8ff5fc3613" />
<img width="1919" height="749" alt="Screenshot 2026-06-04 181928" src="https://github.com/user-attachments/assets/36e2437f-4198-40ad-ba08-e15ea6162f62" />
<img width="1917" height="492" alt="Screenshot 2026-06-04 181303" src="https://github.com/user-attachments/assets/6f5bb239-5a6e-4759-b023-db8a95bcaa1c" />
<img width="1919" height="507" alt="Screenshot 2026-06-04 181504" src="https://github.com/user-attachments/assets/f1ce91e7-bbef-4467-ab5a-d68a996b6d1e" />



---

## Logging Stack (EFK)

The EFK stack consists of:

* Elasticsearch
* Fluent Bit
* Kibana

### Log Collection Flow

```text
Application Logs → Fluent Bit → Elasticsearch → Kibana
```

### Kibana Dashboards

Custom dashboards were created for:

* Error Tracking
* Request Volume
* HTTP Status Codes
* Top Endpoints
* Application Activity Analysis

---

## CI/CD Pipeline

GitHub Actions is used to implement Continuous Integration and Continuous Deployment.

### CI Pipeline

Triggered on Pull Requests targeting the `main` branch.

#### CI Steps

* Terraform Validate
* Docker Build Verification
* Helm/Kubernetes Manifest Linting
* Artifact Upload

This ensures infrastructure and application changes are validated before merge.

### CD Pipeline

Triggered on Push events to the `main` branch.

#### CD Steps

* Terraform Plan
* Terraform Apply
* Docker Build
* Docker Image Push
* Helm Deployment
* Rollout Verification
* API Smoke Tests

This provides fully automated infrastructure provisioning and application deployment.

---

## Terraform Deployment

### Prerequisites

* AWS CLI installed
* Terraform installed
* AWS permissions through aws configure, iam role etc. for EKS deployment

### Remote State Setup

Create an S3 bucket for Terraform state storage.

```bash
aws s3 mb s3://your-s3-bucket-name --region your-region
```

Update the bucket name inside:

```bash
terraform-eks/providers.tf
```

### Deploy Infrastructure

```bash
cd terraform-eks

terraform init

terraform validate

terraform plan

terraform apply
```

---

## Application Deployment

Update your kubeconfig:

```bash
aws eks update-kubeconfig \
  --region <your-aws-region> \
  --name <your-cluster-name>
```

Deploy the application:

```bash
helm install node-app helm-chart-node-app -n node-app --create-namespace=true
```

Verify deployment:

```bash
kubectl get pods -n node-app

kubectl get svc -n node-app

kubectl get ingress -n node-app
```

---

## Architecture Overview

```text
                    GitHub
                       |
                       |
                 GitHub Actions
                 /            \
                /              \
         Terraform           Docker
              |                 |
              |                 |
              v                 v
         AWS Infrastructure   Docker Hub
              |
              |
              v
            Amazon EKS
              |
   --------------------------------
   |              |              |
   v              v              v
Node App     Prometheus      EFK Stack
                 |               |
                 v               v
             Grafana         Kibana
```

<img width="2460" height="2312" alt="image" src="https://github.com/user-attachments/assets/c4b0a16a-d6ea-421f-9fce-4f937810af8c" />


---

## Challenges & Solutions

### 1. CloudDrove IAM Module Compatibility Issue

#### Issue

The latest version of the CloudDrove IAM Role module failed during deployment due to an issue within the module configuration.

#### Solution

Instead of modifying the module source code maually (which would create issues in CI/CD workflow), an earlier stable version of the module was used.

This resolved the issue while preserving upgradeability and automation.

---

### 2. Cluster Autoscaler Permission Issue

#### Issue

The Cluster Autoscaler pod continuously crashed due to missing AWS permissions.

Investigation showed:

* IAM role existed
* Policies were attached
* Pod Identity Association existed

However, the Autoscaler deployment was starting before the Pod Identity Association was fully created.

#### Solution

A Terraform `depends_on` relationship was added to ensure:

```text
IAM Role
    ↓
Pod Identity Association
    ↓
Cluster Autoscaler Deployment
```

This guaranteed the workload received permissions before startup and eliminated the issue permanently.

---

## Future Improvements

### Enable HTTPS Using cert-manager

Currently the application can be exposed over HTTP.

A production-grade improvement would be integrating cert-manager with Let's Encrypt.

Benefits include:

* Automatic TLS certificate generation
* Automatic certificate renewal
* Encrypted communication
* Improved security posture
* Production-ready ingress configuration

Implementation would involve:

1. Installing cert-manager
2. Creating a ClusterIssuer
3. Integrating Ingress resources with TLS
4. Automatically provisioning Let's Encrypt certificates

### Additional Enhancements

* ArgoCD GitOps deployment model
* External Secrets Operator integration
* Grafana Alerting
* Multi-environment support (Dev / Stage / Prod)
* AWS Load Balancer Controller

---

## Technologies Used

### Cloud & Infrastructure

* AWS EKS
* AWS VPC
* Terraform

### Containerization

* Docker
* Docker Hub

### Kubernetes

* Amazon EKS
* Helm
* NGINX Ingress Controller
* Cluster Autoscaler

### Monitoring

* Prometheus
* Grafana

### Logging

* Elasticsearch
* Fluent Bit
* Kibana

### CI/CD

* GitHub Actions

### Application

* Node.js
* Express.js

---

## References

* https://github.com/terraform-aws-modules/terraform-aws-eks
* https://github.com/terraform-aws-modules/terraform-aws-vpc
* https://github.com/clouddrove/terraform-aws-iam-role
* https://kubernetes.io
* https://helm.sh
* https://prometheus.io
* https://grafana.com
* https://www.elastic.co
