import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check overall system health' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async checkAll() {
    return this.healthService.checkAll();
  }

  @Public()
  @Get('database')
  @ApiOperation({ summary: 'Check database health' })
  @ApiResponse({ status: 200, description: 'Database health status' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Public()
  @Get('redis')
  @ApiOperation({ summary: 'Check Redis health' })
  @ApiResponse({ status: 200, description: 'Redis health status' })
  async checkRedis() {
    return this.healthService.checkRedis();
  }

  @Public()
  @Get('minio')
  @ApiOperation({ summary: 'Check MinIO health' })
  @ApiResponse({ status: 200, description: 'MinIO health status' })
  async checkMinio() {
    return this.healthService.checkMinio();
  }

  @Public()
  @Get('ai-service')
  @ApiOperation({ summary: 'Check AI service health' })
  @ApiResponse({ status: 200, description: 'AI service health status' })
  async checkAiService() {
    return this.healthService.checkAiService();
  }

  @Public()
  @Get('worker-queues')
  @ApiOperation({ summary: 'Check worker queues health' })
  @ApiResponse({ status: 200, description: 'Worker queues health status' })
  async checkWorkerQueues() {
    return this.healthService.checkWorkerQueues();
  }

  @Public()
  @Get('external-apis')
  @ApiOperation({ summary: 'Check external APIs health' })
  @ApiResponse({ status: 200, description: 'External APIs health status' })
  async checkExternalApis() {
    return this.healthService.checkExternalApis();
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({ summary: 'Get health check history' })
  @ApiResponse({ status: 200, description: 'Health check history' })
  @ApiBearerAuth()
  async getHistory() {
    return this.healthService.getHealthHistory();
  }

  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  @ApiOperation({ summary: 'Get health check statistics' })
  @ApiResponse({ status: 200, description: 'Health check statistics' })
  @ApiBearerAuth()
  async getStatistics() {
    return this.healthService.getHealthStatistics();
  }
}
