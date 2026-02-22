import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsObject, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RuleType, RuleStatus, RuleSeverity, RuleExecutionFrequency } from '../entities/rule.entity';
import { CreateRuleDto } from './create-rule.dto';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {
  @ApiProperty({ example: 'HIGH_RISK_JURISDICTION_CHECK', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'High-Risk Jurisdiction Check', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Check if client is located in or does business with high-risk jurisdictions', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: RuleType, required: false })
  @IsEnum(RuleType)
  @IsOptional()
  type?: RuleType;

  @ApiProperty({ enum: RuleStatus, required: false })
  @IsEnum(RuleStatus)
  @IsOptional()
  status?: RuleStatus;

  @ApiProperty({ enum: RuleSeverity, required: false })
  @IsEnum(RuleSeverity)
  @IsOptional()
  severity?: RuleSeverity;

  @ApiProperty({ enum: RuleExecutionFrequency, required: false })
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
    required: false
  })
  @IsObject()
  @IsOptional()
  conditions?: Record<string, any>;

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
    required: false
  })
  @IsArray()
  @IsOptional()
  actions?: Array<{
    type: string;
    parameters: Record<string, any>;
  }>;

  @ApiProperty({ example: 20, required: false })
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

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isSystemRule?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  requiresManualReview?: boolean;

  @ApiProperty({ example: 'Additional notes about the rule', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
