#!/bin/bash

# Stop docker compose for each service
docker compose -f docker-compose.yml -f order-service/docker-compose.yml down
docker compose -f docker-compose.yml -f balance-service/docker-compose.yml down
docker compose -f docker-compose.yml -f delivery-service/docker-compose.yml down

# Stop containers
docker stop order-service-order-service-1 order-service-order-db-1
docker stop delivery-service-delivery-service-1 delivery-service-delivery-db-1
docker stop balance-service-balance-service-1 balance-service-balance-db-1
docker stop order-service-kafka-1

# Remove containers
docker rm order-service-order-service-1 order-service-order-db-1
docker rm delivery-service-delivery-service-1 delivery-service-delivery-db-1
docker rm balance-service-balance-service-1 balance-service-balance-db-1
docker rm order-service-kafka-1

# Stop docker compose
docker compose down

# Remove unused networks, volumes, and images
docker network prune -f
docker volume prune -f
docker system prune -f