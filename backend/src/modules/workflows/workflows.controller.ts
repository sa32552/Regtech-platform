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
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowJobDto } from './dto/create-workflow-job.dto';
import { UpdateWorkflowJobDto } from './dto/update-workflow-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JobStatus, JobType } from './entities/workflow-job.entity';

@ApiTags('workflows')
@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Create a new workflow job' })
  @ApiResponse({ status: 201, description: 'Workflow job successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  create(@Body() createWorkflowJobDto: CreateWorkflowJobDto, @Req() req) {
    return this.workflowsService.create(createWorkflowJobDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all workflow jobs' })
  @ApiResponse({ status: 200, description: 'List of all workflow jobs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  findAll(@Query('clientId') clientId?: string, @Query('status') status?: JobStatus) {
    return this.workflowsService.findAll(clientId, status);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get workflow job statistics' })
  @ApiResponse({ status: 200, description: 'Workflow job statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getStatistics() {
    return this.workflowsService.getJobStatistics();
  }

  @Get('by-status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get workflow jobs by status' })
  @ApiResponse({ status: 200, description: 'List of workflow jobs with specified status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: true })
  getJobsByStatus(@Query('status') status: JobStatus) {
    return this.workflowsService.findAll(undefined, status);
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get workflow jobs by type' })
  @ApiResponse({ status: 200, description: 'List of workflow jobs with specified type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'type', enum: JobType, required: true })
  getJobsByType(@Query('type') type: JobType) {
    // This would need to be implemented in the service
    return this.workflowsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a workflow job by ID' })
  @ApiResponse({ status: 200, description: 'Workflow job details' })
  @ApiResponse({ status: 404, description: 'Workflow job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update a workflow job' })
  @ApiResponse({ status: 200, description: 'Workflow job successfully updated' })
  @ApiResponse({ status: 404, description: 'Workflow job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  update(@Param('id') id: string, @Body() updateWorkflowJobDto: UpdateWorkflowJobDto) {
    return this.workflowsService.update(id, updateWorkflowJobDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update workflow job status' })
  @ApiResponse({ status: 200, description: 'Workflow job status successfully updated' })
  @ApiResponse({ status: 404, description: 'Workflow job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus,
    @Body('errorMessage') errorMessage?: string,
  ) {
    return this.workflowsService.updateStatus(id, status, errorMessage);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a workflow job' })
  @ApiResponse({ status: 204, description: 'Workflow job successfully deleted' })
  @ApiResponse({ status: 404, description: 'Workflow job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  // KYC Workflow Endpoints
  @Post('kyc/:kycRecordId/client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Start KYC workflow for a client' })
  @ApiResponse({ status: 201, description: 'KYC workflow successfully started' })
  @ApiResponse({ status: 404, description: 'KYC record or client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  startKycWorkflow(@Param('kycRecordId') kycRecordId: string, @Param('clientId') clientId: string) {
    return this.workflowsService.startKycWorkflow(kycRecordId, clientId);
  }

  // AML Workflow Endpoints
  @Post('aml/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Start AML screening for a client' })
  @ApiResponse({ status: 201, description: 'AML screening successfully started' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  startAmlScreening(@Param('clientId') clientId: string) {
    return this.workflowsService.startAmlScreening(clientId);
  }

  // Document Workflow Endpoints
  @Post('document-ocr/:documentId/client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Start document OCR processing' })
  @ApiResponse({ status: 201, description: 'Document OCR successfully started' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  startDocumentOcr(@Param('documentId') documentId: string, @Param('clientId') clientId: string) {
    return this.workflowsService.startDocumentOcr(documentId, clientId);
  }

  // Risk Scoring Endpoints
  @Post('risk-scoring/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Start risk scoring for a client' })
  @ApiResponse({ status: 201, description: 'Risk scoring successfully started' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  startRiskScoring(@Param('clientId') clientId: string) {
    return this.workflowsService.startRiskScoring(clientId);
  }

  // Rules Execution Endpoints
  @Post('rules/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Execute rules for a client' })
  @ApiResponse({ status: 201, description: 'Rules execution successfully started' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  executeRules(@Param('clientId') clientId: string, @Body('ruleIds') ruleIds: string[]) {
    return this.workflowsService.executeRules(clientId, ruleIds);
  }

  // Alert Generation Endpoints
  @Post('alert/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Generate an alert for a client' })
  @ApiResponse({ status: 201, description: 'Alert successfully generated' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  generateAlert(@Param('clientId') clientId: string, @Body('alertData') alertData: Record<string, any>) {
    return this.workflowsService.generateAlert(clientId, alertData);
  }

  // Scheduled Workflows Endpoints
  @Post('schedule/kyc-review/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Schedule KYC review reminder' })
  @ApiResponse({ status: 201, description: 'KYC review reminder successfully scheduled' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  scheduleKycReviewReminder(
    @Param('clientId') clientId: string,
    @Body('reviewDate') reviewDate: Date,
  ) {
    return this.workflowsService.scheduleKycReviewReminder(clientId, reviewDate);
  }

  @Post('schedule/document-expiry/:documentId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Schedule document expiry check' })
  @ApiResponse({ status: 201, description: 'Document expiry check successfully scheduled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  scheduleDocumentExpiryCheck(
    @Param('documentId') documentId: string,
    @Body('expiryDate') expiryDate: Date,
  ) {
    return this.workflowsService.scheduleDocumentExpiryCheck(documentId, expiryDate);
  }
}
