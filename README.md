About the Project

This repository contains all the microservices required for expense tracker application

Built With

- [Node.js][nodejs-url]
- [PostgreSQL][postgresql-url]
- [Sequelize][sequelize-url]
- [Apache Kafka][apache-kafka-url]
- [Redis][redis-url]

Prerequisites:

- Expense Tracker Backend
  - Before launching any of the microservices navigate to [Expense Tracker Backend Repository][expense-tracker-backend] and complete all the prerequisites specified in the README.md

Get Started With Messages Microservice

- Create .env file and update with appropriate values(refer ./expense-tracker-messages-service/.env.example)

- Navigate to expense-tracker-messages-service
  ```sh
  cd expense-tracker-messages-service
  ```
- Install dependencies
  ```sh
  npm install
  ```
- Start Application
  ```sh
  npm run dev
  ```

Get Started With Caching Microservice

- Create .env file and update with appropriate values(refer ./expense-tracker-caching-service/.env.example)

- Navigate to expense-tracker-caching-service
  ```sh
  cd expense-tracker-caching-service
  ```
- Install dependencies
  ```sh
  npm install
  ```
- Start Application
  ```sh
  npm run dev
  ```

[expense-tracker-backend]: https://github.com/harishankar1608/expense-tracker-backend
[nodejs-url]: https://nodejs.org/en
[postgresql-url]: https://www.postgresql.org/
[apache-kafka-url]: https://kafka.apache.org/
[redis-url]: https://redis.io/
[sequelize-url]: https://sequelize.org/
