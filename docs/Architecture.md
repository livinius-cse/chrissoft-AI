# System Architecture

## Component Overview

```
                        +----------------------+
                        |    Next.js Portal    |
                        |   (Vendor & Buyer)   |
                        +----------------------+
                                   |
                                   v
                        +----------------------+
                        |    Medusa Backend    |
                        |    (Apps/Backend)    |
                        +----------------------+
                                   |
            +----------------------+----------------------+
            |                      |                      |
            v                      v                      v
+-----------------------+ +------------------+ +-----------------------+
|  Mercur Multi-Vendor  | | Database Service | |     AI Services       |
|    (Marketplace)      | | (Prisma Schema)  | |  (Gemini/RAG Engine)  |
+-----------------------+ +------------------+ +-----------------------+
```

## Modular Structure
- **Core Commerce**: Medusa manages cart, order lifecycle, promotions, and customers.
- **Marketplace Logic**: Mercur handles seller onboarding, commissions, and splits.
- **Custom Procurement Modules**: Custom workspace packages handle B2B-specific flows (RFQs, quotations, purchase orders).
