# DEAL WITH
This project involves developing a web application, including a server with REST-style APIs and a SPA front-end, that allows students to buy and sell used university textbooks by creating and bidding on auctions.

This document provides instructions on how to set up and run the project services, including the frontend, backend, and MongoDB database.

## Prerequisites

Before you begin, ensure that you have the following installed on your machine:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

Additionally, ensure that the following ports are not in use by any other service:

- **Frontend**: 4200
- **Backend**: 3000, 3001
- **MongoDB**: 27017

## Setup

1. **Unpack the zip file**: Ensure that you have the project cloned to your local machine.

2. **Create `.env` file**: You need to create a `.env` file in the `taw-backend` directory. Use the provided `.env.example` file as a template. To do this, you can run the following command:

   ```bash
   cp ./taw-backend/.env.example ./taw-backend/.env
   ```
   ```bash
   cp ./.env.example ./.env
   ```

   Make sure to update the `.env` file with any necessary configuration values specific to your environment.

## Starting the Services

To start all the services, run the following command from the root directory of your project:

```bash
docker compose up -d --build
```

This will build and start the following containers:

- **Frontend** (`taw-frontend`):
    - Accessible at `http://localhost:4200`
    - Source code is mounted from `./taw-frontend/src` to `/app/src` in the container.

- **Backend** (`taw-backend`):
    - Accessible at `http://localhost:3000`
    - Source code, models, and config files are mounted from their respective directories.
    - Depends on the MongoDB service.

- **MongoDB** (`mongodb`):
    - Runs on port `27017`
    - The database is auto-populated using initialization scripts located in `./initdb.d/`.
    - Data is persisted using the mounted volumes.

### Accessing the Application

Once the services are up and running, you can access the frontend application locally at:

```
http://localhost:4200
```

This is the main entry point for the application.

## Troubleshooting

- If the services fail to start, ensure that the required ports (4200, 3000, 3001, 27017) are not being used by other processes.
- Verify that the `.env` file is correctly configured with the necessary environment variables.

## Stopping the Services

To stop all running services, use the following command:

```bash
docker compose down
```

This will stop and remove all the containers defined in your `docker-compose.yml` file.

---

Feel free to reach out if you encounter any issues or need further assistance!
