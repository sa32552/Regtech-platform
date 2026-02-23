import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Multer } from 'multer';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DocumentStatus, DocumentType } from './entities/kyc-document.entity';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document for a client' })
  @ApiResponse({ status: 201, description: 'Document successfully uploaded' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'Failed to upload file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer or Analyst role required' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(DocumentType),
        },
        expirationDate: {
          type: 'string',
          format: 'date',
        },
        notes: {
          type: 'string',
        },
      },
    },
  })
  async uploadDocument(
    @Param('clientId') clientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req,
  ) {
    return this.documentsService.create(clientId, file, createDocumentDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'List of all documents' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  findAll(@Query('clientId') clientId?: string) {
    return this.documentsService.findAll(clientId);
  }

  @Get('by-status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get documents by status' })
  @ApiResponse({ status: 200, description: 'List of documents with specified status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'status', enum: DocumentStatus, required: true })
  getDocumentsByStatus(@Query('status') status: DocumentStatus) {
    return this.documentsService.getDocumentsByStatus(status);
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get documents by type' })
  @ApiResponse({ status: 200, description: 'List of documents with specified type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'type', enum: DocumentType, required: true })
  getDocumentsByType(@Query('type') type: DocumentType) {
    return this.documentsService.getDocumentsByType(type);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get documents for a specific client' })
  @ApiResponse({ status: 200, description: 'List of documents for the client' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getDocumentsByClient(@Param('clientId') clientId: string) {
    return this.documentsService.getDocumentsByClient(clientId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({ status: 200, description: 'Document file' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Failed to retrieve file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadDocument(@Param('id') id: string) {
    const stream = await this.documentsService.getDocumentStream(id);
    const document = await this.documentsService.findOne(id);
    return new StreamableFile(stream, {
      type: document.mimeType,
      disposition: `attachment; filename="${document.originalName}"`,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, description: 'Document successfully updated' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update document status' })
  @ApiResponse({ status: 200, description: 'Document status successfully updated' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: DocumentStatus,
    @Req() req,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.documentsService.updateStatus(id, status, req.user.sub, rejectionReason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 204, description: 'Document successfully deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
