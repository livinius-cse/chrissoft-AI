# Database Design

The database schema is normalized and managed using Prisma.

## Key Models
- **Organization**: B2B Tenant group.
- **User**: Multi-role user bound to an organization.
- **Role & Permission**: Granular RBAC permissions.
- **Vendor**: Onboarded seller associated with an organization.
- **Product & Category**: Items for B2B transactions.
- **RFQ**: Request for Quotation submitted by buyers.
- **Quotation**: Price quotes submitted by vendors in response to an RFQ.
- **Purchase Order**: Confirmed buyer order from a selected quotation.
- **Invoice & Payment**: Transactional payment tracking.
- **AIRecommendation**: Smart vendor match scoring based on history.
