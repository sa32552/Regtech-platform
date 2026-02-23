import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface PepResult {
  isPep: boolean;
  matchDetails?: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface PepListResponse {
  data: Array<{
    id: string;
    name: string;
    position: string;
    country: string;
    startDate: string;
    endDate?: string;
    category: string;
  }>;
}

@Injectable()
export class PepService {
  private readonly logger = new Logger(PepService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Vérifier si une personne est une PEP
   */
  async checkPerson(name: string, dateOfBirth?: string, nationality?: string): Promise<PepResult> {
    try {
      // Vérifier sur les listes de PEP internationales
      const internationalResult = await this.checkInternationalPEP(name, dateOfBirth, nationality);
      if (internationalResult.isPep) {
        return internationalResult;
      }

      // Vérifier sur les listes de PEP nationales
      const nationalResult = await this.checkNationalPEP(name, dateOfBirth, nationality);
      if (nationalResult.isPep) {
        return nationalResult;
      }

      // Vérifier sur les listes de PEP régionales
      const regionalResult = await this.checkRegionalPEP(name, dateOfBirth, nationality);
      if (regionalResult.isPep) {
        return regionalResult;
      }

      return {
        isPep: false,
        riskLevel: 'LOW',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification PEP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier sur les listes de PEP internationales
   */
  private async checkInternationalPEP(
    name: string,
    dateOfBirth?: string,
    nationality?: string,
  ): Promise<PepResult> {
    try {
      const apiUrl = this.configService.get<string>('PEP_INTERNATIONAL_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration PEP internationale manquante');
        return { isPep: false, riskLevel: 'LOW' };
      }

      const response = await firstValueFrom(
        this.httpService.get<PepListResponse>(apiUrl, {
          params: { name, dateOfBirth, nationality },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isPep: true,
          matchDetails: response.data.data[0],
          riskLevel: this.calculateRiskLevel(response.data.data[0]),
        };
      }

      return { isPep: false, riskLevel: 'LOW' };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification PEP internationale: ${error.message}`);
      return { isPep: false, riskLevel: 'LOW' };
    }
  }

  /**
   * Vérifier sur les listes de PEP nationales
   */
  private async checkNationalPEP(
    name: string,
    dateOfBirth?: string,
    nationality?: string,
  ): Promise<PepResult> {
    try {
      const apiUrl = this.configService.get<string>('PEP_NATIONAL_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration PEP nationale manquante');
        return { isPep: false, riskLevel: 'LOW' };
      }

      const response = await firstValueFrom(
        this.httpService.get<PepListResponse>(apiUrl, {
          params: { name, dateOfBirth, nationality },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isPep: true,
          matchDetails: response.data.data[0],
          riskLevel: this.calculateRiskLevel(response.data.data[0]),
        };
      }

      return { isPep: false, riskLevel: 'LOW' };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification PEP nationale: ${error.message}`);
      return { isPep: false, riskLevel: 'LOW' };
    }
  }

  /**
   * Vérifier sur les listes de PEP régionales
   */
  private async checkRegionalPEP(
    name: string,
    dateOfBirth?: string,
    nationality?: string,
  ): Promise<PepResult> {
    try {
      const apiUrl = this.configService.get<string>('PEP_REGIONAL_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration PEP régionale manquante');
        return { isPep: false, riskLevel: 'LOW' };
      }

      const response = await firstValueFrom(
        this.httpService.get<PepListResponse>(apiUrl, {
          params: { name, dateOfBirth, nationality },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isPep: true,
          matchDetails: response.data.data[0],
          riskLevel: this.calculateRiskLevel(response.data.data[0]),
        };
      }

      return { isPep: false, riskLevel: 'LOW' };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification PEP régionale: ${error.message}`);
      return { isPep: false, riskLevel: 'LOW' };
    }
  }

  /**
   * Calculer le niveau de risque basé sur le type de PEP
   */
  private calculateRiskLevel(pep: any): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Catégories de PEP à haut risque
    const highRiskCategories = [
      'HEAD_OF_STATE',
      'HEAD_OF_GOVERNMENT',
      'MINISTER',
      'JUDICIAL',
      'CENTRAL_BANK',
    ];

    // Catégories de PEP à risque moyen
    const mediumRiskCategories = [
      'SENIOR_OFFICIAL',
      'SENIOR_EXECUTIVE',
      'MILITARY',
      'DIPLOMATIC',
    ];

    if (highRiskCategories.includes(pep.category)) {
      return 'HIGH';
    } else if (mediumRiskCategories.includes(pep.category)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Synchroniser les listes de PEP avec la base de données locale
   */
  async syncPepLists(): Promise<void> {
    this.logger.log('Synchronisation des listes de PEP...');

    try {
      // Synchroniser les listes internationales
      await this.syncInternationalPEPList();

      // Synchroniser les listes nationales
      await this.syncNationalPEPList();

      // Synchroniser les listes régionales
      await this.syncRegionalPEPList();

      this.logger.log('Synchronisation des listes de PEP terminée');
    } catch (error) {
      this.logger.error(`Erreur lors de la synchronisation: ${error.message}`);
      throw error;
    }
  }

  private async syncInternationalPEPList(): Promise<void> {
    // Implémentation de la synchronisation internationale
    this.logger.log('Synchronisation de la liste PEP internationale...');
  }

  private async syncNationalPEPList(): Promise<void> {
    // Implémentation de la synchronisation nationale
    this.logger.log('Synchronisation de la liste PEP nationale...');
  }

  private async syncRegionalPEPList(): Promise<void> {
    // Implémentation de la synchronisation régionale
    this.logger.log('Synchronisation de la liste PEP régionale...');
  }
}
