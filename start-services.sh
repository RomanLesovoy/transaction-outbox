#!/bin/bash

# Stop all services
docker compose down -v

# Run docker compose
docker compose up -d

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 15

# Run docker compose for each service
docker compose -f order-service/docker-compose.yml up -d
docker compose -f balance-service/docker-compose.yml up -d
docker compose -f delivery-service/docker-compose.yml up -d