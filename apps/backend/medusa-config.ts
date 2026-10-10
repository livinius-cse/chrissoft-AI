import { withMercur } from '@mercurjs/core';

const config = {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgrespassword@localhost:5432/medusa_procurement",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001",
    }
  },
  modules: [],
  plugins: []
};

export default withMercur(config);
