import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule, RuleType, RuleStatus, RuleSeverity, RuleExecutionFrequency } from './entities/rule.entity';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
    private readonly workflowsService: WorkflowsService,
  ) {}

  async create(createRuleDto: CreateRuleDto, createdById: string): Promise<Rule> {
    // Check if rule code already exists
    const existingRule = await this.ruleRepository.findOne({
      where: { code: createRuleDto.code },
    });

    if (existingRule) {
      throw new BadRequestException('Rule with this code already exists');
    }

    // Create new rule
    const newRule = this.ruleRepository.create({
      ...createRuleDto,
      createdById,
      version: 1,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    });

    return this.ruleRepository.save(newRule);
  }

  async findAll(
    type?: RuleType,
    status?: RuleStatus,
    severity?: RuleSeverity,
  ): Promise<Rule[]> {
    const query = this.ruleRepository.createQueryBuilder('rule')
      .leftJoinAndSelect('rule.createdBy', 'createdBy')
      .leftJoinAndSelect('rule.updatedBy', 'updatedBy');

    if (type) {
      query.andWhere('rule.type = :type', { type });
    }

    if (status) {
      query.andWhere('rule.status = :status', { status });
    }

    if (severity) {
      query.andWhere('rule.severity = :severity', { severity });
    }

    return query.orderBy('rule.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return rule;
  }

  async findByCode(code: string): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({
      where: { code },
      relations: ['createdBy', 'updatedBy'],
    });

    if (!rule) {
      throw new NotFoundException(`Rule with code ${code} not found`);
    }

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto, updatedById: string): Promise<Rule> {
    const rule = await this.findOne(id);

    // Track changes for version history
    const changes = [];
    if (updateRuleDto.name && updateRuleDto.name !== rule.name) {
      changes.push(`Name changed from '${rule.name}' to '${updateRuleDto.name}'`);
    }
    if (updateRuleDto.description && updateRuleDto.description !== rule.description) {
      changes.push('Description updated');
    }
    if (updateRuleDto.conditions) {
      changes.push('Conditions updated');
    }
    if (updateRuleDto.actions) {
      changes.push('Actions updated');
    }

    // Update rule
    Object.assign(rule, updateRuleDto, {
      updatedById,
      version: rule.version + 1,
    });

    // Add to version history
    if (changes.length > 0) {
      if (!rule.versionHistory) {
        rule.versionHistory = [];
      }
      rule.versionHistory.push({
        version: rule.version,
        changedAt: new Date(),
        changedBy: updatedById,
        changes,
      });
    }

    return this.ruleRepository.save(rule);
  }

  async updateStatus(id: string, status: RuleStatus, updatedById: string): Promise<Rule> {
    const rule = await this.findOne(id);

    rule.status = status;
    rule.updatedById = updatedById;
    rule.version = rule.version + 1;

    // Add to version history
    if (!rule.versionHistory) {
      rule.versionHistory = [];
    }
    rule.versionHistory.push({
      version: rule.version,
      changedAt: new Date(),
      changedBy: updatedById,
      changes: [`Status changed to ${status}`],
    });

    return this.ruleRepository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);

    // Don't allow deletion of system rules
    if (rule.isSystemRule) {
      throw new BadRequestException('Cannot delete system rules');
    }

    await this.ruleRepository.remove(rule);
  }

  async executeRule(ruleId: string, clientId: string): Promise<any> {
    const rule = await this.findOne(ruleId);

    if (rule.status !== RuleStatus.ACTIVE) {
      throw new BadRequestException('Cannot execute inactive rules');
    }

    // Update execution statistics
    rule.executionCount += 1;
    rule.lastExecutedAt = new Date();

    try {
      // Execute the rule
      const result = await this.performRuleExecution(rule, clientId);

      // Update success statistics
      rule.successCount += 1;
      rule.lastSuccessAt = new Date();

      await this.ruleRepository.save(rule);

      return {
        success: true,
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        result,
      };
    } catch (error) {
      // Update failure statistics
      rule.failureCount += 1;
      rule.lastFailureAt = new Date();

      await this.ruleRepository.save(rule);

      return {
        success: false,
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        error: error.message,
      };
    }
  }

  async executeRules(ruleIds: string[], clientId: string): Promise<any[]> {
    const results = [];

    for (const ruleId of ruleIds) {
      const result = await this.executeRule(ruleId, clientId);
      results.push(result);
    }

    return results;
  }

  async getRulesByType(type: RuleType): Promise<Rule[]> {
    return this.ruleRepository.find({
      where: { type },
      relations: ['createdBy', 'updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRulesByStatus(status: RuleStatus): Promise<Rule[]> {
    return this.ruleRepository.find({
      where: { status },
      relations: ['createdBy', 'updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveRules(): Promise<Rule[]> {
    return this.ruleRepository.find({
      where: { status: RuleStatus.ACTIVE },
      relations: ['createdBy', 'updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSystemRules(): Promise<Rule[]> {
    return this.ruleRepository.find({
      where: { isSystemRule: true },
      relations: ['createdBy', 'updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCustomRules(): Promise<Rule[]> {
    return this.ruleRepository.find({
      where: { isSystemRule: false },
      relations: ['createdBy', 'updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRuleStatistics(): Promise<any> {
    const totalRules = await this.ruleRepository.count();
    const activeRules = await this.ruleRepository.count({ where: { status: RuleStatus.ACTIVE } });
    const inactiveRules = await this.ruleRepository.count({ where: { status: RuleStatus.INACTIVE } });
    const draftRules = await this.ruleRepository.count({ where: { status: RuleStatus.DRAFT } });
    const archivedRules = await this.ruleRepository.count({ where: { status: RuleStatus.ARCHIVED } });

    const systemRules = await this.ruleRepository.count({ where: { isSystemRule: true } });
    const customRules = await this.ruleRepository.count({ where: { isSystemRule: false } });

    const rulesByType = {};
    for (const type of Object.values(RuleType)) {
      rulesByType[type] = await this.ruleRepository.count({ where: { type } });
    }

    const rulesBySeverity = {};
    for (const severity of Object.values(RuleSeverity)) {
      rulesBySeverity[severity] = await this.ruleRepository.count({ where: { severity } });
    }

    return {
      total: totalRules,
      byStatus: {
        active: activeRules,
        inactive: inactiveRules,
        draft: draftRules,
        archived: archivedRules,
      },
      byType: rulesByType,
      bySeverity: rulesBySeverity,
      system: systemRules,
      custom: customRules,
    };
  }

  private async performRuleExecution(rule: Rule, clientId: string): Promise<any> {
    // This would implement the actual rule execution logic
    // For now, we'll create a workflow job to execute the rule

    const job = await this.workflowsService.executeRules(clientId, [rule.id]);

    // Wait for the job to complete (in a real implementation, this would be async)
    // For now, we'll return a mock result

    return {
      executedAt: new Date(),
      clientId,
      ruleId: rule.id,
      ruleCode: rule.code,
      passed: Math.random() > 0.3, // Mock result
      severity: rule.severity,
      impact: rule.riskScoreImpact,
      actions: rule.actions,
    };
  }
}
