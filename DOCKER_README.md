# 🐳 FlowForge Docker Setup

## Quick Start

### 1. Prerequisites

- Docker Desktop installed and running
- Copy `.env.docker` to `.env` and configure your API keys

### 2. Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Development Environment

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 🚀 Access FlowForge

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📁 Data Persistence

- **Database**: Stored in Docker volume `backend_data`
- **Logs**: Stored in Docker volume `backend_logs`

## 🔧 Configuration

### Environment Variables

Copy `.env.docker` to `.env` and configure:

```env
OPENAI_API_KEY=your_openai_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
SESSION_SECRET=your_secure_session_secret_here
JWT_SECRET=your_secure_jwt_secret_here
```

## 🛠️ Docker Commands

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### View Services

```bash
# List running containers
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Database Management

```bash
# Access backend container
docker-compose exec backend sh

# Backup database
docker-compose exec backend cp /app/data/workflows.db /app/data/backup.db

# View database files
docker-compose exec backend ls -la /app/data/
```

### Troubleshooting

```bash
# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Clean up volumes (⚠️ This will delete data)
docker-compose down -v
```

## 🔍 Health Checks

Both services include health checks:

- **Backend**: `curl -f http://localhost:3001/api/health`
- **Frontend**: `curl -f http://localhost:3000`

## 📊 Monitoring

View container stats:

```bash
docker stats
```

## 🚨 Production Notes

1. **Security**: Change default secrets in production
2. **Volumes**: Backup data volumes regularly
3. **Updates**: Use specific image versions instead of `latest`
4. **Resources**: Monitor container resource usage
