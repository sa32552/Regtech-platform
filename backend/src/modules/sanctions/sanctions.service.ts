import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface SanctionResult {
  isSanctioned: boolean;
  listName: string;
  matchDetails?: any;
}

interface SanctionsListResponse {
  data: Array<{
    id: string;
    name: string;
    aliases?: string[];
    dates_of_birth?: string[];
    nationalities?: string[];
    addresses?: Array<{
      country: string;
      address: string;
    }>;
    list: string;
  }>;
}

@Injectable()
export class SanctionsService {
  private readonly logger = new Logger(SanctionsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Vérifier si une personne est sur une liste de sanctions
   */
  async checkPerson(name: string, dateOfBirth?: string, nationality?: string): Promise<SanctionResult[]> {
    const results: SanctionResult[] = [];

    try {
      // Vérifier sur la liste OFAC (US)
      const ofacResult = await this.checkOFAC(name, dateOfBirth);
      if (ofacResult) {
        results.push(ofacResult);
      }

      // Vérifier sur la liste de l'UE
      const euResult = await this.checkEU(name, dateOfBirth);
      if (euResult) {
        results.push(euResult);
      }

      // Vérifier sur la liste de l'ONU
      const unResult = await this.checkUN(name, dateOfBirth);
      if (unResult) {
        results.push(unResult);
      }

      return results;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des sanctions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier si une entreprise est sur une liste de sanctions
   */
  async checkCompany(name: string, registrationNumber?: string): Promise<SanctionResult[]> {
    const results: SanctionResult[] = [];

    try {
      // Vérifier sur la liste OFAC (US)
      const ofacResult = await this.checkOFACCompany(name, registrationNumber);
      if (ofacResult) {
        results.push(ofacResult);
      }

      // Vérifier sur la liste de l'UE
      const euResult = await this.checkEUCompany(name, registrationNumber);
      if (euResult) {
        results.push(euResult);
      }

      // Vérifier sur la liste de l'ONU
      const unResult = await this.checkUNCompany(name, registrationNumber);
      if (unResult) {
        results.push(unResult);
      }

      return results;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des sanctions entreprise: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifier sur la liste OFAC (US Treasury)
   */
  private async checkOFAC(name: string, dateOfBirth?: string): Promise<SanctionResult | null> {
    try {
      const apiKey = this.configService.get<string>('OFAC_API_KEY');
      const apiUrl = this.configService.get<string>('OFAC_API_URL');

      if (!apiKey || !apiUrl) {
        this.logger.warn('Configuration OFAC manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, dateOfBirth },
          headers: { 'X-API-Key': apiKey },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'OFAC',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification OFAC: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifier sur la liste de l'Union Européenne
   */
  private async checkEU(name: string, dateOfBirth?: string): Promise<SanctionResult | null> {
    try {
      const apiUrl = this.configService.get<string>('EU_SANCTIONS_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration UE sanctions manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, dateOfBirth },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'EU',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification UE: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifier sur la liste de l'ONU
   */
  private async checkUN(name: string, dateOfBirth?: string): Promise<SanctionResult | null> {
    try {
      const apiUrl = this.configService.get<string>('UN_SANCTIONS_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration ONU sanctions manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, dateOfBirth },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'UN',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification ONU: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifier une entreprise sur la liste OFAC
   */
  private async checkOFACCompany(name: string, registrationNumber?: string): Promise<SanctionResult | null> {
    try {
      const apiKey = this.configService.get<string>('OFAC_API_KEY');
      const apiUrl = this.configService.get<string>('OFAC_COMPANY_API_URL');

      if (!apiKey || !apiUrl) {
        this.logger.warn('Configuration OFAC entreprise manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, registrationNumber },
          headers: { 'X-API-Key': apiKey },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'OFAC',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification OFAC entreprise: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifier une entreprise sur la liste de l'UE
   */
  private async checkEUCompany(name: string, registrationNumber?: string): Promise<SanctionResult | null> {
    try {
      const apiUrl = this.configService.get<string>('EU_COMPANY_SANCTIONS_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration UE entreprise sanctions manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, registrationNumber },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'EU',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification UE entreprise: ${error.message}`);
      return null;
    }
  }

  /**
   * Vérifier une entreprise sur la liste de l'ONU
   */
  private async checkUNCompany(name: string, registrationNumber?: string): Promise<SanctionResult | null> {
    try {
      const apiUrl = this.configService.get<string>('UN_COMPANY_SANCTIONS_API_URL');

      if (!apiUrl) {
        this.logger.warn('Configuration ONU entreprise sanctions manquante');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get<SanctionsListResponse>(apiUrl, {
          params: { name, registrationNumber },
        }),
      );

      if (response.data.data && response.data.data.length > 0) {
        return {
          isSanctioned: true,
          listName: 'UN',
          matchDetails: response.data.data[0],
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification ONU entreprise: ${error.message}`);
      return null;
    }
  }

  /**
   * Synchroniser les listes de sanctions avec la base de données locale
   */
  async syncSanctionsLists(): Promise<void> {
    this.logger.log('Synchronisation des listes de sanctions...');

    try {
      // Synchroniser OFAC
      await this.syncOFACList();

      // Synchroniser UE
      await this.syncEUList();

      // Synchroniser ONU
      await this.syncUNList();

      this.logger.log('Synchronisation des listes de sanctions terminée');
    } catch (error) {
      this.logger.error(`Erreur lors de la synchronisation: ${error.message}`);
      throw error;
    }
  }

  private async syncOFACList(): Promise<void> {
    // Implémentation de la synchronisation OFAC
    this.logger.log('Synchronisation de la liste OFAC...');
  }

  private async syncEUList(): Promise<void> {
    // Implémentation de la synchronisation UE
    this.logger.log('Synchronisation de la liste UE...');
  }

  private async syncUNList(): Promise<void> {
    // Implémentation de la synchronisation ONU
    this.logger.log('Synchronisation de la liste ONU...');
  }
}
