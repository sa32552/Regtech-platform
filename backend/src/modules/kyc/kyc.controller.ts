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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { CreateKycRecordDto } from './dto/create-kyc-record.dto';
import { UpdateKycRecordDto } from './dto/update-kyc-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { KycStatus, KycLevel } from './entities/kyc-record.entity';

@ApiTags('kyc')
@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST)
  @ApiOperation({ summary: 'Create a new KYC record for a client' })
  @ApiResponse({ status: 201, description: 'KYC record successfully created' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 400, description: 'A pending KYC record already exists for this client' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer or Analyst role required' })
  create(
    @Param('clientId') clientId: string,
    @Body() createKycRecordDto: CreateKycRecordDto,
    @Req() req,
  ) {
    return this.kycService.create(clientId, createKycRecordDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all KYC records' })
  @ApiResponse({ status: 200, description: 'List of all KYC records' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  findAll(@Query('clientId') clientId?: string) {
    return this.kycService.findAll(clientId);
  }

  @Get('by-status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC records by status' })
  @ApiResponse({ status: 200, description: 'List of KYC records with specified status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'status', enum: KycStatus, required: true })
  getKycRecordsByStatus(@Query('status') status: KycStatus) {
    return this.kycService.getKycRecordsByStatus(status);
  }

  @Get('by-level')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC records by level' })
  @ApiResponse({ status: 200, description: 'List of KYC records with specified level' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'level', enum: KycLevel, required: true })
  getKycRecordsByLevel(@Query('level') level: KycLevel) {
    return this.kycService.getKycRecordsByLevel(level);
  }

  @Get('due-for-review')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC records due for review' })
  @ApiResponse({ status: 200, description: 'List of KYC records due for review' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getKycRecordsDueForReview() {
    return this.kycService.getKycRecordsDueForReview();
  }

  @Get('client/:clientId/latest')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get latest KYC record for a client' })
  @ApiResponse({ status: 200, description: 'Latest KYC record for the client' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getClientLatestKycRecord(@Param('clientId') clientId: string) {
    return this.kycService.getClientLatestKycRecord(clientId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a KYC record by ID' })
  @ApiResponse({ status: 200, description: 'KYC record details' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.kycService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update a KYC record' })
  @ApiResponse({ status: 200, description: 'KYC record successfully updated' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  update(@Param('id') id: string, @Body() updateKycRecordDto: UpdateKycRecordDto) {
    return this.kycService.update(id, updateKycRecordDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update KYC record status' })
  @ApiResponse({ status: 200, description: 'KYC record status successfully updated' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: KycStatus,
    @Req() req,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.kycService.updateStatus(id, status, req.user.sub, rejectionReason);
  }

  @Patch(':id/risk-score')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update KYC record risk score' })
  @ApiResponse({ status: 200, description: 'KYC record risk score successfully updated' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateRiskScore(@Param('id') id: string, @Body('riskScore') riskScore: number) {
    return this.kycService.updateRiskScore(id, riskScore);
  }

  @Patch(':id/risk-factor')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Add a risk factor to KYC record' })
  @ApiResponse({ status: 200, description: 'Risk factor successfully added' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  addRiskFactor(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('description') description: string,
    @Body('severity') severity: 'LOW' | 'MEDIUM' | 'HIGH',
  ) {
    return this.kycService.addRiskFactor(id, type, description, severity);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a KYC record' })
  @ApiResponse({ status: 204, description: 'KYC record successfully deleted' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.kycService.remove(id);
  }
}
