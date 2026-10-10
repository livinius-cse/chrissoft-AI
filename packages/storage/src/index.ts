import { Client } from 'minio';

export class StorageService {
  private client: Client;
  private defaultBuckets = ['product-images', 'invoices', 'purchase-orders', 'contracts', 'vendor-documents'];

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadminpassword',
    });
  }

  async initBuckets() {
    for (const bucket of this.defaultBuckets) {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket, 'us-east-1');
      }
    }
  }

  async uploadFile(bucket: string, objectName: string, filePath: string) {
    return this.client.fPutObject(bucket, objectName, filePath, {});
  }

  async getPresignedUrl(bucket: string, objectName: string, expires: number = 24 * 60 * 60) {
    return this.client.presignedGetObject(bucket, objectName, expires);
  }
}
