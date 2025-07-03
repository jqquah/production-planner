# Soluxe Production Planner

This is the main repository for the Soluxe Production Planner application. It contains the source code for the frontend, backend, and the necessary infrastructure configurations to run the application using Docker.

## Project Structure

```
.
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── index.js
│   └── package.json
├── db/
│   └── init/
│       └── 01-init.sql
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   └── tsconfig.json
├── nginx/
│   ├── nginx.dev.conf
│   └── nginx.prod.conf
├── .env.example
├── .taskmaster/
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

- **`backend/`**: Contains the Node.js/Express backend service.
- **`db/`**: Holds the PostgreSQL database initialization scripts.
- **`frontend/`**: Contains the React/TypeScript frontend application.
- **`nginx/`**: Holds the Nginx configuration files for development and production.
- **`.taskmaster/`**: Contains configuration and task files for the `task-master-ai` tool.
- **`docker-compose.yml`**: Defines the services, networks, and volumes for the **development** environment.
- **`docker-compose.prod.yml`**: Defines the services for the **production** environment.
- **`.env.example`**: An example file for the required environment variables.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Development Environment

To run the application in a development environment with hot-reloading enabled, follow these steps:

1.  **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd soluxe-production
    ```

2.  **Build and start the containers:**

    ```sh
    docker compose up --build
    ```

3.  **Access the application:**

    - The frontend is available at [http://localhost](http://localhost).
    - The backend API is available at [http://localhost/api](http://localhost/api).

4.  **To stop the containers:**
    ```sh
    docker compose down
    ```

### Production Environment

To simulate a production environment, follow these steps:

1.  **Create a `.env` file:**

    Copy the `.env.example` file to a new file named `.env` and fill in the required database credentials.

    ```sh
    cp .env.example .env
    ```

    **Note:** Make sure to change the default `POSTGRES_PASSWORD` to a secure password.

2.  **Build and start the containers:**

    Use the `docker-compose.prod.yml` file to build and run the production-optimized containers.

    ```sh
    docker compose -f docker-compose.prod.yml up --build
    ```

3.  **Access the application:**

    The application will be available at [http://localhost](http://localhost).

4.  **To stop the containers:**
    ```sh
    docker compose -f docker-compose.prod.yml down
    ```

## Services

- **`db`**: A PostgreSQL database service. The data is persisted in a Docker volume.
- **`backend`**: The Node.js backend API server.
- **`frontend`**: The React frontend application.
- **`nginx`**: A reverse proxy that routes traffic to the frontend and backend services.

## Continuous Integration & Deployment

This project is configured with GitHub Actions to automate linting, testing, building, and deployment.

- **Linting (`lint.yml`)**: Runs `eslint` on the `frontend` and `backend` code on every push and pull request to the `main` branch.
- **Testing (`test.yml`)**: Runs `jest` tests for both services on every push and pull request to `main`.
- **Build & Push (`build-and-push.yml`)**: Builds production Docker images and pushes them to Docker Hub on every push to `main`.
- **Deploy (`deploy.yml`)**: Deploys the application to a production server after the `Build & Push` workflow completes successfully.

### Versioning & Release Strategy

This project uses a Git tag-based versioning strategy to manage releases.

1.  **Create a Version Tag**: To create a new release, create and push a new Git tag following semantic versioning (e.g., `v1.0.1`):
    ```bash
    git tag v1.0.1
    git push origin v1.0.1
    ```
2.  **Automated Build & Push**: Pushing a new version tag automatically triggers the `build-and-push.yml` workflow. This builds the production Docker images and tags them with the version number (e.g., `your-username/soluxe-backend:v1.0.1`) and `latest`.
3.  **Automated Deployment**: Once the images are successfully built and pushed to Docker Hub, the `deploy.yml` workflow is triggered, which deploys the new `latest` images to the production server.

### Deployment Setup

To enable automated deployment, you need to:

1.  **Prepare a server** with Docker and Docker Compose installed.
2.  **Add the following secrets** to your GitHub repository (`Settings` > `Secrets and variables` > `Actions`):
    - `DOCKERHUB_USERNAME`: Your Docker Hub username.
    - `DOCKERHUB_TOKEN`: A Docker Hub access token.
    - `SSH_HOST`: The IP address or hostname of your deployment server.
    - `SSH_USERNAME`: The username for SSH login.
    - `SSH_PRIVATE_KEY`: The private SSH key for authentication.
    - `ENV_FILE`: The complete content of your production `.env` file. This will be written to `.env` on the server during deployment.
