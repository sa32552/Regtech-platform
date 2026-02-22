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
import { AmlService } from './aml.service';
import { CreateAmlAlertDto } from './dto/create-aml-alert.dto';
import { UpdateAmlAlertDto } from './dto/update-aml-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AlertSeverity, AlertStatus, AlertType } from './entities/aml-alert.entity';

@ApiTags('aml')
@Controller('aml')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AmlController {
  constructor(private readonly amlService: AmlService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Create a new AML alert' })
  @ApiResponse({ status: 201, description: 'AML alert successfully created' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  create(@Body() createAmlAlertDto: CreateAmlAlertDto) {
    return this.amlService.create(createAmlAlertDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all AML alerts' })
  @ApiResponse({ status: 200, description: 'List of all AML alerts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: AlertStatus,
    @Query('severity') severity?: AlertSeverity,
    @Query('type') type?: AlertType,
  ) {
    return this.amlService.findAll(clientId, status, severity, type);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get AML alert statistics' })
  @ApiResponse({ status: 200, description: 'AML alert statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getStatistics() {
    return this.amlService.getAlertStatistics();
  }

  @Get('high-risk')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get high-risk AML alerts' })
  @ApiResponse({ status: 200, description: 'List of high-risk AML alerts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getHighRiskAlerts() {
    return this.amlService.getHighRiskAlerts();
  }

  @Get('unassigned')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get unassigned AML alerts' })
  @ApiResponse({ status: 200, description: 'List of unassigned AML alerts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getUnassignedAlerts() {
    return this.amlService.getUnassignedAlerts();
  }

  @Get('by-status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get AML alerts by status' })
  @ApiResponse({ status: 200, description: 'List of AML alerts with specified status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'status', enum: AlertStatus, required: true })
  getAlertsByStatus(@Query('status') status: AlertStatus) {
    return this.amlService.getAlertsByStatus(status);
  }

  @Get('by-severity')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get AML alerts by severity' })
  @ApiResponse({ status: 200, description: 'List of AML alerts with specified severity' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'severity', enum: AlertSeverity, required: true })
  getAlertsBySeverity(@Query('severity') severity: AlertSeverity) {
    return this.amlService.getAlertsBySeverity(severity);
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get AML alerts by type' })
  @ApiResponse({ status: 200, description: 'List of AML alerts with specified type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'type', enum: AlertType, required: true })
  getAlertsByType(@Query('type') type: AlertType) {
    return this.amlService.getAlertsByType(type);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get AML alerts for a client' })
  @ApiResponse({ status: 200, description: 'List of AML alerts for the client' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getAlertsByClient(@Param('clientId') clientId: string) {
    return this.amlService.getAlertsByClient(clientId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get an AML alert by ID' })
  @ApiResponse({ status: 200, description: 'AML alert details' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.amlService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update an AML alert' })
  @ApiResponse({ status: 200, description: 'AML alert successfully updated' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  update(@Param('id') id: string, @Body() updateAmlAlertDto: UpdateAmlAlertDto) {
    return this.amlService.update(id, updateAmlAlertDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update AML alert status' })
  @ApiResponse({ status: 200, description: 'AML alert status successfully updated' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AlertStatus,
    @Req() req,
    @Body('resolutionNotes') resolutionNotes?: string,
  ) {
    return this.amlService.updateStatus(id, status, req.user.sub, resolutionNotes);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST)
  @ApiOperation({ summary: 'Acknowledge an AML alert' })
  @ApiResponse({ status: 200, description: 'AML alert successfully acknowledged' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer or Analyst role required' })
  acknowledgeAlert(@Param('id') id: string, @Req() req) {
    return this.amlService.acknowledgeAlert(id, req.user.sub);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Assign an AML alert to a user' })
  @ApiResponse({ status: 200, description: 'AML alert successfully assigned' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  assignAlert(@Param('id') id: string, @Body('assignedToId') assignedToId: string) {
    return this.amlService.assignAlert(id, assignedToId);
  }

  @Patch(':id/escalate')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Escalate an AML alert' })
  @ApiResponse({ status: 200, description: 'AML alert successfully escalated' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  escalateAlert(
    @Param('id') id: string,
    @Body('escalatedToId') escalatedToId: string,
    @Body('escalationReason') escalationReason: string,
  ) {
    return this.amlService.escalateAlert(id, escalatedToId, escalationReason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an AML alert' })
  @ApiResponse({ status: 204, description: 'AML alert successfully deleted' })
  @ApiResponse({ status: 404, description: 'AML alert not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.amlService.remove(id);
  }
}
