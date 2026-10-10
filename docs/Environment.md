# Environment Configuration

Create a `.env` file in the root and configure:

```env
# Database Configuration
DATABASE_URL="postgres://postgres:postgrespassword@localhost:5432/medusa_procurement"

# Redis Queue
REDIS_URL="redis://localhost:6379"

# MinIO storage
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadminpassword"
MINIO_USE_SSL=false

# Typesense search
TYPESENSE_HOST="localhost"
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL="http"
TYPESENSE_API_KEY="typesense_api_key_123"

# JWT Auth
JWT_SECRET="super_secret_procurement_key"
```
