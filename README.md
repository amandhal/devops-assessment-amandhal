# DevOps Assessment - AWS EKS Infrastructure with CI/CD Automation

A production-grade infrastructure-as-code project demonstrating automated provisioning and deployment of a microservices application on AWS EKS with complete CI/CD pipeline.

## Project Overview

This project automates the entire lifecycle of deploying a containerized Node.js application to AWS EKS, including:
- Infrastructure provisioning using Terraform
- Kubernetes cluster setup with EKS
- Microservices deployment with Helm
- Continuous Integration/Continuous Deployment with GitHub Actions
- Auto-scaling and monitoring

## Architecture
<img width="2460" height="2312" alt="image" src="https://github.com/user-attachments/assets/3619033d-551c-45dc-a944-ccec2522645e" />

### Infrastructure Layer (Terraform - HCL)
- **AWS EKS Cluster**: Managed Kubernetes using official AWS and EKS Terraform modules
- **IAM Roles**: CloudDrove's IAM role module for secure access management
- **Custom Components**:
  - Cluster Autoscaler for dynamic node scaling
  - NGINX Ingress Controller for L7 routing
  - Metrics Server for resource monitoring
  - Network Load Balancer (NLB) for external access

### Application Layer (Node.js)
- Frontend and Backend microservices
- 2 Kubernetes Deployments (separate frontend & backend)
- 2 ClusterIP Services for internal service discovery
- Horizontal Pod Autoscaler (HPA) for automatic scaling on both deployments

### Container & Deployment
- Docker containerization of Node applications
- Images pushed to Docker Hub/ECR
- Custom Helm charts for Kubernetes deployment
- Ingress configuration with NLB for external user access

## Scaling Configuration

- **Pod Auto-scaling**: HPA monitors CPU/memory metrics and scales replicas
- **Node Auto-scaling**: Cluster Autoscaler adjusts node count based on pending pods
- **External Load Balancing**: NLB distributes traffic across backend instances


## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Infrastructure as Code | Terraform | Cloud resource provisioning |
| Container Orchestration | AWS EKS | Managed Kubernetes |
| Containerization | Docker | Application packaging |
| Package Management | Helm | Kubernetes deployments |
| External Access | NGINX Ingress Controller | Application routing |
| Auto-scaling | HPA + Cluster Autoscaler | Dynamic resource scaling |
| Monitoring | Metrics Server | Resource metrics collection |
| Application Framework | Node.js | Microservices |
| CI/CD | GitHub Actions | Automated deployment pipeline |


# CI/CD Pipeline Overview

This GitHub Actions workflow automates the validation, deployment, and verification of the application using separate Continuous Integration (CI) and Continuous Deployment (CD) stages.

## Continuous Integration (Pull Requests)

The CI pipeline is triggered whenever a Pull Request is opened against the `main` branch.

### Workflow Steps

1. Checkout the repository source code.
2. Configure Terraform and initialize the infrastructure code.
3. Validate Terraform configurations.
4. Build frontend and backend Docker images to verify successful image creation.
5. Lint the Helm chart to validate Kubernetes manifests and chart structure.
6. Upload the Helm chart as a workflow artifact for inspection.

This stage ensures that infrastructure code, application containers, and Kubernetes manifests are valid before merging changes into the main branch.

---

## Continuous Deployment (Push to Main)

The CD pipeline is triggered whenever code is merged into the `main` branch.

### Workflow Steps

1. Checkout the repository source code.
2. Configure AWS credentials and Terraform.
3. Provision or update AWS infrastructure using Terraform.
4. Build frontend and backend Docker images.
5. Push versioned Docker images to Docker Hub using the Git commit SHA as the image tag.
6. Configure access to the EKS cluster by updating the kubeconfig.
7. Deploy or upgrade the application using Helm.
8. Verify successful rollout of frontend and backend deployments.
9. Execute smoke tests to confirm application health and connectivity.

---

## Deployment Strategy

- Docker images are tagged using the Git commit SHA to provide immutable versioning.
- Helm performs deployments using `helm upgrade --install`, enabling both initial installation and subsequent upgrades.
- Rollout checks ensure Kubernetes deployments become healthy before proceeding.
- Smoke tests validate that frontend and backend services are reachable after deployment.

This approach provides automated validation, infrastructure provisioning, application deployment, and post-deployment verification within a single GitHub Actions workflow.

## Issues Faced & Fixes

### 1. IAM Role Module Compatibility Issue

While provisioning the EKS infrastructure, the latest version of the CloudDrove IAM Role module produced errors during deployment. After troubleshooting, I switched to a previous stable version of the module, which resolved the issue and allowed the infrastructure to be provisioned successfully.

**Fix:**

* Downgraded to a stable module version.
* Verified successful Terraform deployment with the compatible release.

### 2. Cluster Autoscaler Startup Dependency Issue

During the initial deployment, the Cluster Autoscaler pod was created before the AWS EKS Pod Identity association was fully available. As a result, the Cluster Autoscaler failed to start correctly because it could not assume the required IAM permissions.

**Fix:**

* Performed a rollout restart of the Cluster Autoscaler deployment after Pod Identity became available.
* Updated the Terraform code to explicitly manage resource dependencies using `depends_on`, ensuring Pod Identity resources are created before deploying the Cluster Autoscaler.
* Re-tested the deployment and confirmed that the issue no longer occurs.

## Improvements Roadmap

### Helm Chart Enhancements

* Improve chart reusability by introducing additional templating and configurable values.
* Support easier deployment customization across different environments.

### Terraform Improvements

* Replace remaining hardcoded values with variables and locals.
* Increase module flexibility and reusability for future deployments.

### Security & Networking

* Integrate Cert-Manager to automate TLS certificate provisioning and renewal.
* Enable HTTPS for application ingress endpoints.

### Kubernetes Modernization

* Evaluate migration from Ingress resources to the Kubernetes Gateway API.
* Leverage Gateway API's improved traffic management and extensibility features.

### Observability

* Add Prometheus and Grafana for monitoring and visualization.
* Implement centralized logging for improved troubleshooting and operational visibility.



# Manual Deployment Steps

## Prerequisites

* AWS CLI configured
* Terraform installed
* Docker installed
* kubectl installed
* Helm installed
* Docker Hub account

## Infrastructure Deployment

1. Clone the repository:

```bash
git clone <repository-url>
cd devops-assessment-amandhal
```

2. Create an S3 bucket for the Terraform remote backend.

3. Configure AWS credentials:

```bash
aws configure
```

4. Navigate to the Terraform directory:

```bash
cd terraform
```

5. Initialize Terraform:

```bash
terraform init
```

6. Provision the infrastructure:

```bash
terraform apply -auto-approve
```

This step creates the VPC, EKS cluster, managed node group, IAM roles, Cluster Autoscaler, Metrics Server, NAT GW, NLB and NGINX Ingress Controller.

---

## Application Deployment

1. Login to Docker Hub:

```bash
docker login
```

2. Build and push the frontend image:

```bash
cd docker-node-app/frontend

docker build -t <dockerhub-username>/node-app-frontend:<tag> .
docker push <dockerhub-username>/node-app-frontend:<tag>
```

3. Build and push the backend image:

```bash
cd ../backend

docker build -t <dockerhub-username>/node-app-backend:<tag> .
docker push <dockerhub-username>/node-app-backend:<tag>
```

---

## Kubernetes Deployment

Deploy the application using Helm:

```bash
helm upgrade --install node-app ./helm-chart-node-app \
  -n node-app \
  --create-namespace \
  --set image.frontend.tag=<tag> \
  --set image.backend.tag=<tag>
```

Verify the deployment:

```bash
aws eks update-kubeconfig \
  --region <aws-region> \
  --name <cluster-name>
kubectl get pods -n node-app
kubectl get svc -n node-app
kubectl get ingress -n node-app
```

# Automated CI/CD Deployment 

The project includes a GitHub Actions workflow that automates infrastructure provisioning, application deployment, and deployment verification.

## Prerequisites

Configure the following GitHub repository secrets:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `DOCKERHUB_USERNAME`
* `DOCKERHUB_PASSWORD`

## Deployment Process

1. Push changes to a feature branch and create a Pull Request against the `main` branch.

2. The Continuous Integration (CI) pipeline is automatically triggered and performs:

   * Terraform validation
   * Docker image build validation
   * Helm chart linting

3. After the Pull Request is reviewed and merged into `main`, the Continuous Deployment (CD) pipeline is automatically triggered.

4. The CD pipeline performs the following actions:

   * Provisions or updates AWS infrastructure using Terraform
   * Builds frontend and backend Docker images
   * Pushes images to Docker Hub using the Git commit SHA as the image tag
   * Configures access to the EKS cluster
   * Deploys or upgrades the application using Helm
   * Verifies deployment rollouts
   * Executes smoke tests to validate application availability

## Result

Once code is merged into the `main` branch, the complete infrastructure and application deployment process is executed automatically without requiring any manual intervention.
