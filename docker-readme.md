# Hospital Management System (HMS) Docker Setup

This project contains a Hospital Management System with Laravel backend and Next.js frontend, all containerized with Docker.

## Requirements

- Docker
- Docker Compose

## Getting Started

### Setting up the project

1. Clone the repository
```bash
git clone <repository_url>
cd HMS_NEW
```

2. Build and start the containers
```bash
docker-compose up -d
```

3. Generate Laravel application key (if not already generated)
```bash
docker exec -it hms_backend php artisan key:generate
```

4. Run Laravel migrations to set up the database
```bash
docker exec -it hms_backend php artisan migrate
```

5. Seed the database with initial data (optional)
```bash
docker exec -it hms_backend php artisan db:seed
```

### Accessing the applications

- Frontend (Next.js): http://localhost:3000
- Backend API (Laravel): http://localhost:8000
- phpMyAdmin: http://localhost:8080 (username: hms_user, password: hms_password)

### Development workflow

- Frontend code is in the `frontend` directory
- Backend code is in the `Backend` directory
- Database data is persisted in a Docker volume

## Container Management

### Start containers
```bash
docker-compose up -d
```

### Stop containers
```bash
docker-compose down
```

### Rebuild containers after changes to Dockerfile
```bash
docker-compose up -d --build
```

### View logs
```bash
# All logs
docker-compose logs

# Specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

### Execute commands in containers
```bash
# Laravel artisan commands
docker exec -it hms_backend php artisan <command>

# Composer commands
docker exec -it hms_backend composer <command>

# NPM commands in frontend
docker exec -it hms_frontend npm <command>
```

## Troubleshooting

- If you encounter permission issues with Laravel storage, run:
```bash
docker exec -it hms_backend chmod -R 775 storage
docker exec -it hms_backend chown -R www:www storage
```

- If the frontend doesn't connect to the backend API, ensure your API URLs are correctly configured to point to the backend container.
