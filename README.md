# Transactional Box

## Project Description

Transactional Box is a microservices architecture designed to process orders, check balances, and manage deliveries. The project uses Kafka for messaging between services and PostgreSQL as a database for each service.

## Project Structure

- **order-service**: Manages the creation and processing of orders.
- **balance-service**: Checks the balance of the user before confirming the order.
- **delivery-service**: Manages the delivery process after confirming the order.
- **Kafka**: Used for messaging between services.
- **PostgreSQL**: Used for storing data for each service.

## Environment Variables

Ensure you have a `.env` file with the necessary environment variables, such as:

```
KAFKA_BROKER_ID=1
KAFKA_INTERNAL_PORT=29092
KAFKA_EXTERNAL_PORT=9092
ORDER_DB_NAME=order_db
ORDER_DB_USER=order_user
ORDER_DB_PASSWORD=order_pass
ORDER_DB_PORT=5432
BALANCE_DB_NAME=balance_db
BALANCE_DB_USER=balance_user
BALANCE_DB_PASSWORD=balance_pass
BALANCE_DB_PORT=5433
DELIVERY_DB_NAME=delivery_db
DELIVERY_DB_USER=delivery_user
DELIVERY_DB_PASSWORD=delivery_pass
DELIVERY_DB_PORT=5434
```

## Dependencies

- **Node.js**: Used for developing microservices.
- **Kafka**: Used for messaging.
- **PostgreSQL**: Used for storing data.

## License

This project is licensed under the MIT License.