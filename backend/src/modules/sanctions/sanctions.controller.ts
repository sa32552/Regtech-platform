import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SanctionsService } from './sanctions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('sanctions')
@Controller('sanctions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SanctionsController {
  constructor(private readonly sanctionsService: SanctionsService) {}

  @Post('check-person')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Vérifier si une personne est sur une liste de sanctions' })
  @ApiResponse({ status: 200, description: 'Résultats de la vérification' })
  async checkPerson(
    @Body('name') name: string,
    @Body('dateOfBirth') dateOfBirth?: string,
    @Body('nationality') nationality?: string,
  ) {
    return this.sanctionsService.checkPerson(name, dateOfBirth, nationality);
  }

  @Post('check-company')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Vérifier si une entreprise est sur une liste de sanctions' })
  @ApiResponse({ status: 200, description: 'Résultats de la vérification' })
  async checkCompany(
    @Body('name') name: string,
    @Body('registrationNumber') registrationNumber?: string,
  ) {
    return this.sanctionsService.checkCompany(name, registrationNumber);
  }

  @Post('sync')
  @Roles('admin')
  @ApiOperation({ summary: 'Synchroniser les listes de sanctions' })
  @ApiResponse({ status: 200, description: 'Synchronisation terminée' })
  async syncSanctionsLists() {
    return this.sanctionsService.syncSanctionsLists();
  }

  @Get('status')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Obtenir le statut des listes de sanctions' })
  @ApiResponse({ status: 200, description: 'Statut des listes' })
  async getSanctionsStatus() {
    // Implémentation à compléter
    return {
      ofac: { lastSync: new Date(), status: 'active' },
      eu: { lastSync: new Date(), status: 'active' },
      un: { lastSync: new Date(), status: 'active' },
    };
  }
}
