#!/bin/bash
docker build -t amandhal/node-app-backend:1.0.0 docker-node-app/backend/
docker build -t amandhal/node-app-frontend:1.0.0 docker-node-app/frontend/
docker push amandhal/node-app-backend:1.0.0
docker push amandhal/node-app-frontend:1.0.0