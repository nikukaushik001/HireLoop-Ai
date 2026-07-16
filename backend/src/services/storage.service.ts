import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string = '';

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.AWS_S3_BUCKET || 'hireloop-resumes';

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey
        }
      });
      console.log('AWS S3 storage initialized successfully.');
    } else {
      console.log('AWS S3 credentials missing. Using local file storage fallback under backend/uploads/');
    }
  }

  /**
   * Uploads a file buffer to S3 or stores it locally as fallback.
   * Returns the file path or S3 URL.
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uniqueFileName = `${Date.now()}-${fileName}`;

    if (this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: uniqueFileName,
          Body: fileBuffer,
          ContentType: mimeType,
        });
        await this.s3Client.send(command);
        const region = process.env.AWS_REGION || 'us-east-1';
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${uniqueFileName}`;
      } catch (err) {
        console.error('S3 upload failed. Falling back to local storage:', err);
      }
    }

    // Fallback: Store locally
    const localDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const filePath = path.join(localDir, uniqueFileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Return relative URL path so frontend can fetch it
    return `uploads/${uniqueFileName}`;
  }
}
