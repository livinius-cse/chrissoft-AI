# Folder Structure

```
root/
├── apps/
│   ├── backend/         # Medusa backend integration
│   ├── admin/           # Admin dashboard application
│   ├── vendor-portal/   # Vendor dashboard application
│   └── ai-service/      # AI orchestration microservice
├── packages/
│   ├── procurement/     # B2B Procurement services
│   ├── vendor/          # Vendor management services
│   ├── rfq/             # RFQ workflow management
│   ├── quotations/      # Quotation workflows
│   ├── purchase-orders/ # Purchase order lifecycle
│   ├── inventory/       # Stock tracking and warehouses
│   ├── analytics/       # Spend and performance reports
│   ├── ai/              # Gemini SDK and RAG wrappers
│   ├── notifications/   # BullMQ event queues
│   ├── search/          # Typesense integration
│   ├── storage/         # MinIO client integrations
│   ├── auth/            # JWT & RBAC authentication
│   ├── shared/          # TypeScript domain type definitions
│   └── database/        # Prisma schema and PostgreSQL models
└── infrastructure/
    └── docker/          # Docker configuration files
```
