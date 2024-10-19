#!/bin/bash

# Run RabbitMQ container
docker setup rabbitmq:3-management

# Keep the script running
while true; do
  sleep 60
done