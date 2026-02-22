import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from '../clients/entities/client.entity';
import { KycDocument, DocumentType, DocumentStatus } from './entities/kyc-document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(
    @InjectRepository(KycDocument)
    private readonly documentRepository: Repository<KycDocument>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly configService: ConfigService,
  ) {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL') || false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'regtech-documents';
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  async create(
    clientId: string,
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    uploadedById: string,
  ): Promise<KycDocument> {
    // Check if client exists
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Generate unique object name for MinIO
    const objectName = `clients/${clientId}/documents/${uuidv4()}-${file.originalname}`;

    // Upload file to MinIO
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype },
      );
    } catch (error) {
      throw new BadRequestException('Failed to upload file to storage');
    }

    // Create document record
    const newDocument = this.documentRepository.create({
      clientId,
      type: createDocumentDto.type,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath: objectName,
      minioBucket: this.bucketName,
      minioObjectName: objectName,
      uploadedById,
      status: DocumentStatus.PENDING,
      expirationDate: createDocumentDto.expirationDate,
    });

    return this.documentRepository.save(newDocument);
  }

  async findAll(clientId?: string): Promise<KycDocument[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.client', 'client');

    if (clientId) {
      query.andWhere('document.clientId = :clientId', { clientId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<KycDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async getDocumentStream(id: string): Promise<NodeJS.ReadableStream> {
    const document = await this.findOne(id);

    try {
      return await this.minioClient.getObject(document.minioBucket, document.minioObjectName);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve file from storage');
    }
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<KycDocument> {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async updateStatus(
    id: string,
    status: DocumentStatus,
    verifiedById: string,
    rejectionReason?: string,
  ): Promise<KycDocument> {
    const document = await this.findOne(id);

    document.status = status;
    document.verifiedById = verifiedById;
    document.verifiedAt = new Date();

    if (status === DocumentStatus.REJECTED && rejectionReason) {
      document.rejectionReason = rejectionReason;
    }

    return this.documentRepository.save(document);
  }

  async updateOcrData(id: string, ocrData: Record<string, any>): Promise<KycDocument> {
    const document = await this.findOne(id);
    document.ocrData = ocrData;
    return this.documentRepository.save(document);
  }

  async updateExtractedData(id: string, extractedData: Record<string, any>): Promise<KycDocument> {
    const document = await this.findOne(id);
    document.extractedData = extractedData;
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);

    // Delete file from MinIO
    try {
      await this.minioClient.removeObject(document.minioBucket, document.minioObjectName);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
    }

    // Delete document record
    await this.documentRepository.remove(document);
  }

  async getDocumentsByClient(clientId: string): Promise<KycDocument[]> {
    return this.documentRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDocumentsByStatus(status: DocumentStatus): Promise<KycDocument[]> {
    return this.documentRepository.find({
      where: { status },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDocumentsByType(type: DocumentType): Promise<KycDocument[]> {
    return this.documentRepository.find({
      where: { type },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async getExpiredDocuments(): Promise<KycDocument[]> {
    const today = new Date();
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.expirationDate <= :today', { today })
      .andWhere('document.status != :expiredStatus', { expiredStatus: DocumentStatus.EXPIRED })
      .getMany();
  }

  async markExpiredDocuments(): Promise<void> {
    const expiredDocuments = await this.getExpiredDocuments();

    for (const document of expiredDocuments) {
      document.status = DocumentStatus.EXPIRED;
      await this.documentRepository.save(document);
    }
  }
}
