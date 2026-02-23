import { Controller, Get, Query, Res, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reporting')
@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('kyc/pdf')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Générer un rapport KYC en PDF' })
  @ApiResponse({ status: 200, description: 'Fichier PDF généré' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async generateKycReportPdf(
    @Query() filters: any,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=rapport-kyc.pdf',
    );
    return this.reportingService.generateKycReport(filters, response);
  }

  @Get('aml/pdf')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Générer un rapport AML en PDF' })
  @ApiResponse({ status: 200, description: 'Fichier PDF généré' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async generateAmlReportPdf(
    @Query() filters: any,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=rapport-aml.pdf',
    );
    return this.reportingService.generateAmlReport(filters, response);
  }

  @Get('kyc/excel')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Générer un rapport KYC en Excel' })
  @ApiResponse({ status: 200, description: 'Fichier Excel généré' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async generateKycReportExcel(
    @Query() filters: any,
    @Res() response: Response,
  ) {
    return this.reportingService.generateKycReportExcel(filters, response);
  }

  @Get('aml/excel')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Générer un rapport AML en Excel' })
  @ApiResponse({ status: 200, description: 'Fichier Excel généré' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  async generateAmlReportExcel(
    @Query() filters: any,
    @Res() response: Response,
  ) {
    return this.reportingService.generateAmlReportExcel(filters, response);
  }

  @Post('custom')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Générer un rapport personnalisé' })
  @ApiResponse({ status: 200, description: 'Rapport personnalisé généré' })
  async generateCustomReport(
    @Body() reportConfig: any,
    @Res() response: Response,
  ) {
    // Implémentation à compléter
    return { message: 'Rapport personnalisé en cours de génération' };
  }
}
