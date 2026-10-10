import { Client } from 'typesense';

export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108', 10),
          protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'typesense_api_key_123',
      connectionTimeoutSeconds: 2,
    });
  }

  async initCollections() {
    const collectionsToCreate = [
      {
        name: 'products',
        fields: [
          { name: 'id', type: 'string' as const },
          { name: 'name', type: 'string' as const },
          { name: 'sku', type: 'string' as const, facet: true },
          { name: 'vendor_id', type: 'string' as const, facet: true },
        ],
      },
      {
        name: 'vendors',
        fields: [
          { name: 'id', type: 'string' as const },
          { name: 'name', type: 'string' as const },
          { name: 'organization_id', type: 'string' as const, facet: true },
        ],
      },
      {
        name: 'organizations',
        fields: [
          { name: 'id', type: 'string' as const },
          { name: 'name', type: 'string' as const },
        ],
      },
      {
        name: 'purchase_orders',
        fields: [
          { name: 'id', type: 'string' as const },
          { name: 'vendor_id', type: 'string' as const, facet: true },
          { name: 'status', type: 'string' as const, facet: true },
          { name: 'total_amount', type: 'float' as const },
        ],
      },
      {
        name: 'contracts',
        fields: [
          { name: 'id', type: 'string' as const },
          { name: 'title', type: 'string' as const },
          { name: 'vendor_id', type: 'string' as const, facet: true },
        ],
      },
    ];

    for (const schema of collectionsToCreate) {
      try {
        await this.client.collections(schema.name).retrieve();
      } catch (err) {
        // Collection doesn't exist, create it
        await this.client.collections().create(schema);
      }
    }
  }

  async indexDocument(collection: string, document: object) {
    return this.client.collections(collection).documents().upsert(document);
  }

  async search(collection: string, query: string, queryBy: string) {
    return this.client.collections(collection).documents().search({
      q: query,
      query_by: queryBy,
    });
  }
}
