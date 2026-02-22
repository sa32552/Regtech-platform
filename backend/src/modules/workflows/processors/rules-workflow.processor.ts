import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WorkflowsService } from '../workflows.service';
import { JobType, JobStatus } from '../entities/workflow-job.entity';

@Processor('rules-workflows')
export class RulesWorkflowProcessor {
  private readonly logger = new Logger(RulesWorkflowProcessor.name);

  constructor(private readonly workflowsService: WorkflowsService) {}

  @Process(JobType.RULES_EXECUTION)
  async handleRulesExecution(job: Job): Promise<void> {
    this.logger.log(`Processing rules execution job ${job.id}`);

    await this.workflowsService.updateStatus(job.id, JobStatus.PROCESSING);

    try {
      const { clientId, ruleIds } = job.data.inputData || job.data;

      // Execute compliance rules
      // This would:
      // - Load rules from database
      // - Evaluate rules against client data
      // - Generate alerts for rule violations
      // - Update client risk scores based on rule results

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock rules execution results
      const rulesExecutionResults = {
        executionDate: new Date(),
        clientId,
        rulesExecuted: ruleIds || ['RULE_001', 'RULE_002', 'RULE_003'],
        results: [
          {
            ruleId: 'RULE_001',
            ruleName: 'High-Risk Jurisdiction Check',
            description: 'Check if client is located in or does business with high-risk jurisdictions',
            passed: true,
            severity: 'HIGH',
            impact: 0,
            message: 'Client is not located in a high-risk jurisdiction',
          },
          {
            ruleId: 'RULE_002',
            ruleName: 'PEP Screening',
            description: 'Screen client against Politically Exposed Persons database',
            passed: true,
            severity: 'HIGH',
            impact: 0,
            message: 'No PEP matches found',
          },
          {
            ruleId: 'RULE_003',
            ruleName: 'Business Activity Verification',
            description: 'Verify that business activity is legitimate and compliant',
            passed: false,
            severity: 'MEDIUM',
            impact: 15,
            message: 'Business activity requires additional verification',
          },
        ],
        totalRules: 3,
        passedRules: 2,
        failedRules: 1,
        overallRiskImpact: 15,
        recommendations: [
          'Additional verification required for business activity',
          'Consider enhanced monitoring',
          'Document business activity sources',
        ],
        alertsGenerated: [
          {
            alertId: `ALT-${Date.now()}`,
            type: 'RULE_VIOLATION',
            severity: 'MEDIUM',
            ruleId: 'RULE_003',
            message: 'Business activity requires additional verification',
          },
        ],
      };

      // Update job status to completed with results
      await this.workflowsService.updateStatus(job.id, JobStatus.COMPLETED);
      await this.workflowsService.update(job.id, {
        outputData: rulesExecutionResults,
      });

      this.logger.log(`Rules execution job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Rules execution job ${job.id} failed: ${error.message}`);
      await this.workflowsService.updateStatus(job.id, JobStatus.FAILED, error.message);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }
}
