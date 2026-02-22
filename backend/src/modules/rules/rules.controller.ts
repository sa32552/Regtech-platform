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
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RuleType, RuleStatus, RuleSeverity } from './entities/rule.entity';

@ApiTags('rules')
@Controller('rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Create a new rule' })
  @ApiResponse({ status: 201, description: 'Rule successfully created' })
  @ApiResponse({ status: 409, description: 'Rule with this code already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  create(@Body() createRuleDto: CreateRuleDto, @Req() req) {
    return this.rulesService.create(createRuleDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all rules' })
  @ApiResponse({ status: 200, description: 'List of all rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  findAll(
    @Query('type') type?: RuleType,
    @Query('status') status?: RuleStatus,
    @Query('severity') severity?: RuleSeverity,
  ) {
    return this.rulesService.findAll(type, status, severity);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get rule statistics' })
  @ApiResponse({ status: 200, description: 'Rule statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  getStatistics() {
    return this.rulesService.getRuleStatistics();
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get active rules' })
  @ApiResponse({ status: 200, description: 'List of active rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getActiveRules() {
    return this.rulesService.getActiveRules();
  }

  @Get('system')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get system rules' })
  @ApiResponse({ status: 200, description: 'List of system rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getSystemRules() {
    return this.rulesService.getSystemRules();
  }

  @Get('custom')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get custom rules' })
  @ApiResponse({ status: 200, description: 'List of custom rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin, Compliance Officer, Analyst or Viewer role required' })
  getCustomRules() {
    return this.rulesService.getCustomRules();
  }

  @Get('by-type')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get rules by type' })
  @ApiResponse({ status: 200, description: 'List of rules with specified type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'type', enum: RuleType, required: true })
  getRulesByType(@Query('type') type: RuleType) {
    return this.rulesService.getRulesByType(type);
  }

  @Get('by-status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get rules by status' })
  @ApiResponse({ status: 200, description: 'List of rules with specified status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status, 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  @ApiQuery({ name: 'status', enum: RuleStatus, required: true })
  getRulesByStatus(@Query('status') status: RuleStatus) {
    return this.rulesService.getRulesByStatus(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER, UserRole.ANALYST, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a rule by ID' })
  @ApiResponse({ status: 200, description: 'Rule details' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update a rule' })
  @ApiResponse({ status: 200, description: 'Rule successfully updated' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto, @Req() req) {
    return this.rulesService.update(id, updateRuleDto, req.user.sub);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update rule status' })
  @ApiResponse({ status: 200, description: 'Rule status successfully updated' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  updateStatus(@Param('id') id: string, @Body('status') status: RuleStatus, @Req() req) {
    return this.rulesService.updateStatus(id, status, req.user.sub);
  }

  @Post(':id/execute/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Execute a rule for a client' })
  @ApiResponse({ status: 200, description: 'Rule execution result' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 400, description: 'Cannot execute inactive rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  executeRule(@Param('id') id: string, @Param('clientId') clientId: string) {
    return this.rulesService.executeRule(id, clientId);
  }

  @Post('batch-execute/:clientId')
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Execute multiple rules for a client' })
  @ApiResponse({ status: 200, description: 'Rules execution results' })
  @ApiResponse({ status: 404, description: 'One or more rules not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Compliance Officer role required' })
  executeRules(@Param('clientId') clientId: string, @Body('ruleIds') ruleIds: string[]) {
    return this.rulesService.executeRules(ruleIds, clientId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a rule' })
  @ApiResponse({ status: 204, description: 'Rule successfully deleted' })
  @ApiResponse({ status: 404, description: 'Rule not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system rules' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }
}
