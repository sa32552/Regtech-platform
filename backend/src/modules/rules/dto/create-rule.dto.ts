import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsObject, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { RuleType, RuleStatus, RuleSeverity, RuleExecutionFrequency } from '../entities/rule.entity';

export class CreateRuleDto {
  @ApiProperty({ example: 'HIGH_RISK_JURISDICTION_CHECK' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'High-Risk Jurisdiction Check' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Check if client is located in or does business with high-risk jurisdictions' })
  @IsString()
  description: string;

  @ApiProperty({ enum: RuleType, example: RuleType.GEOGRAPHIC_RISK })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiProperty({ enum: RuleStatus, default: RuleStatus.DRAFT })
  @IsEnum(RuleStatus)
  @IsOptional()
  status?: RuleStatus;

  @ApiProperty({ enum: RuleSeverity, example: RuleSeverity.HIGH })
  @IsEnum(RuleSeverity)
  severity: RuleSeverity;

  @ApiProperty({ enum: RuleExecutionFrequency, default: RuleExecutionFrequency.ON_DEMAND })
  @IsEnum(RuleExecutionFrequency)
  @IsOptional()
  executionFrequency?: RuleExecutionFrequency;

  @ApiProperty({
    example: {
      clientLocation: {
        operator: 'in',
        value: ['AF', 'KP', 'IR', 'MM', 'SD', 'SY', 'YE'],
      },
      businessLocations: {
        operator: 'any_in',
        value: ['AF', 'KP', 'IR', 'MM', 'SD', 'SY', 'YE'],
      },
    },
  })
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty({
    example: [
      {
        type: 'ALERT',
        parameters: {
          severity: 'HIGH',
          message: 'Client is located in or does business with high-risk jurisdictions',
        },
      },
      {
        type: 'RISK_SCORE',
        parameters: {
          impact: 20,
        },
      },
    ],
  })
  @IsArray()
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;

  @ApiProperty({ example: 20, default: 0 })
  @IsNumber()
  @IsOptional()
  riskScoreImpact?: number;

  @ApiProperty({
    example: {
      threshold: 'High',
      description: 'FATF High-Risk Jurisdictions Monitoring List',
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @ApiProperty({ example: 'FATF Recommendation 10', required: false })
  @IsString()
  @IsOptional()
  regulatoryReference?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isSystemRule?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  requiresManualReview?: boolean;

  @ApiProperty({ example: 'Additional notes about the rule', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
