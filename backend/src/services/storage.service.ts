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

  /**
   * Downloads a file from S3 or local storage into a Buffer.
   * Useful when files are temporarily stored in S3 by multer-s3.
   */
  async downloadFile(filePathOrUrl: string): Promise<Buffer> {
    if (filePathOrUrl.startsWith('http')) {
      if (this.s3Client) {
        // Extract key from URL
        const urlParts = filePathOrUrl.split('.amazonaws.com/');
        if (urlParts.length === 2) {
          const key = urlParts[1];
          const { GetObjectCommand } = require('@aws-sdk/client-s3');
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          });
          const response = await this.s3Client.send(command);
          // Convert readable stream to buffer
          const streamToBuffer = async (stream: any) => {
            const chunks = [];
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
          };
          return await streamToBuffer(response.Body);
        }
      }
      // Fallback if s3client isn't configured but it's a URL (try to fetch it directly if public)
      const axios = require('axios');
      const res = await axios.get(filePathOrUrl, { responseType: 'arraybuffer' });
      return Buffer.from(res.data);
    }
    
    // Local file path
    if (fs.existsSync(filePathOrUrl)) {
      return fs.readFileSync(filePathOrUrl);
    }
    throw new Error(`File not found: ${filePathOrUrl}`);
  }

  /**
   * Deletes a file from S3 or local storage.
   */
  async deleteFile(filePathOrUrl: string): Promise<void> {
    if (filePathOrUrl.startsWith('http')) {
      if (this.s3Client) {
        const urlParts = filePathOrUrl.split('.amazonaws.com/');
        if (urlParts.length === 2) {
          const key = urlParts[1];
          const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
          const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
          });
          try {
            await this.s3Client.send(command);
          } catch (err) {
            console.error(`Failed to delete temporary S3 file: ${key}`, err);
          }
        }
      }
      return;
    }
    
    // Local file path
    if (fs.existsSync(filePathOrUrl)) {
      try {
        fs.unlinkSync(filePathOrUrl);
      } catch (err) {
        console.error(`Failed to delete temporary local file: ${filePathOrUrl}`, err);
      }
    }
  }
}
