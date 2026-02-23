import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PepService } from './pep.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pep')
@Controller('pep')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PepController {
  constructor(private readonly pepService: PepService) {}

  @Post('check-person')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Vérifier si une personne est une PEP' })
  @ApiResponse({ status: 200, description: 'Résultats de la vérification' })
  async checkPerson(
    @Body('name') name: string,
    @Body('dateOfBirth') dateOfBirth?: string,
    @Body('nationality') nationality?: string,
  ) {
    return this.pepService.checkPerson(name, dateOfBirth, nationality);
  }

  @Post('sync')
  @Roles('admin')
  @ApiOperation({ summary: 'Synchroniser les listes de PEP' })
  @ApiResponse({ status: 200, description: 'Synchronisation terminée' })
  async syncPepLists() {
    return this.pepService.syncPepLists();
  }

  @Get('status')
  @Roles('admin', 'compliance-officer')
  @ApiOperation({ summary: 'Obtenir le statut des listes de PEP' })
  @ApiResponse({ status: 200, description: 'Statut des listes' })
  async getPepStatus() {
    // Implémentation à compléter
    return {
      international: { lastSync: new Date(), status: 'active' },
      national: { lastSync: new Date(), status: 'active' },
      regional: { lastSync: new Date(), status: 'active' },
    };
  }
}
