import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/entities/client.entity';
import { KycRecord } from '../kyc/entities/kyc-record.entity';
import { AmlAlert } from '../aml/entities/aml-alert.entity';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Readable } from 'stream';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  status?: string;
  type?: string;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(KycRecord)
    private readonly kycRecordRepository: Repository<KycRecord>,
    @InjectRepository(AmlAlert)
    private readonly amlAlertRepository: Repository<AmlAlert>,
  ) {}

  /**
   * Générer un rapport KYC en PDF
   */
  async generateKycReport(filters: ReportFilters, response: Response): Promise<void> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Pipe le PDF vers la réponse HTTP
    doc.pipe(response);

    // En-tête du document
    doc.fontSize(20).text('Rapport KYC', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown();

    // Récupérer les données KYC
    const kycRecords = await this.getKycData(filters);

    // Tableau des enregistrements KYC
    this.drawKycTable(doc, kycRecords);

    // Finaliser le PDF
    doc.end();
  }

  /**
   * Générer un rapport AML en PDF
   */
  async generateAmlReport(filters: ReportFilters, response: Response): Promise<void> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Pipe le PDF vers la réponse HTTP
    doc.pipe(response);

    // En-tête du document
    doc.fontSize(20).text('Rapport AML', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown();

    // Récupérer les données AML
    const amlAlerts = await this.getAmlData(filters);

    // Tableau des alertes AML
    this.drawAmlTable(doc, amlAlerts);

    // Finaliser le PDF
    doc.end();
  }

  /**
   * Générer un rapport KYC en Excel
   */
  async generateKycReportExcel(filters: ReportFilters, response: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rapport KYC');

    // Définir les colonnes
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Client', key: 'clientName', width: 30 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Niveau', key: 'level', width: 15 },
      { header: 'Score de risque', key: 'riskScore', width: 15 },
      { header: 'Date de création', key: 'createdAt', width: 20 },
      { header: 'Date de complétion', key: 'completedAt', width: 20 },
    ];

    // Récupérer les données KYC
    const kycRecords = await this.getKycData(filters);

    // Ajouter les lignes
    kycRecords.forEach(record => {
      worksheet.addRow({
        id: record.id,
        clientName: record.client?.name || 'N/A',
        status: record.status,
        level: record.level,
        riskScore: record.riskScore,
        createdAt: record.createdAt?.toLocaleDateString('fr-FR'),
        completedAt: record.completedAt?.toLocaleDateString('fr-FR'),
      });
    });

    // Configurer la réponse HTTP
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=rapport-kyc.xlsx',
    );

    // Écrire le fichier Excel dans la réponse
    await workbook.xlsx.write(response);
  }

  /**
   * Générer un rapport AML en Excel
   */
  async generateAmlReportExcel(filters: ReportFilters, response: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rapport AML');

    // Définir les colonnes
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Client', key: 'clientName', width: 30 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Sévérité', key: 'severity', width: 15 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Score de risque', key: 'riskScore', width: 15 },
      { header: 'Date de création', key: 'createdAt', width: 20 },
      { header: 'Date de résolution', key: 'resolvedAt', width: 20 },
    ];

    // Récupérer les données AML
    const amlAlerts = await this.getAmlData(filters);

    // Ajouter les lignes
    amlAlerts.forEach(alert => {
      worksheet.addRow({
        id: alert.id,
        clientName: alert.client?.name || 'N/A',
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
        riskScore: alert.riskScore,
        createdAt: alert.createdAt?.toLocaleDateString('fr-FR'),
        resolvedAt: alert.resolvedAt?.toLocaleDateString('fr-FR'),
      });
    });

    // Configurer la réponse HTTP
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=rapport-aml.xlsx',
    );

    // Écrire le fichier Excel dans la réponse
    await workbook.xlsx.write(response);
  }

  /**
   * Dessiner un tableau KYC dans le PDF
   */
  private drawKycTable(doc: PDFKit.PDFDocument, kycRecords: KycRecord[]): void {
    const tableTop = 150;
    const itemY = tableTop;

    // En-têtes de tableau
    doc.fontSize(10);
    doc.text('ID', 50, itemY);
    doc.text('Client', 150, itemY);
    doc.text('Statut', 350, itemY);
    doc.text('Niveau', 450, itemY);
    doc.text('Score', 520, itemY);

    // Ligne de séparation
    doc.moveTo(50, itemY + 15).lineTo(570, itemY + 15).stroke();

    // Données du tableau
    let y = itemY + 25;
    kycRecords.forEach(record => {
      doc.text(record.id.substring(0, 8) + '...', 50, y);
      doc.text(record.client?.name || 'N/A', 150, y);
      doc.text(record.status, 350, y);
      doc.text(record.level, 450, y);
      doc.text(record.riskScore.toString(), 520, y);
      y += 20;
    });
  }

  /**
   * Dessiner un tableau AML dans le PDF
   */
  private drawAmlTable(doc: PDFKit.PDFDocument, amlAlerts: AmlAlert[]): void {
    const tableTop = 150;
    const itemY = tableTop;

    // En-têtes de tableau
    doc.fontSize(10);
    doc.text('ID', 50, itemY);
    doc.text('Client', 150, itemY);
    doc.text('Type', 350, itemY);
    doc.text('Sévérité', 450, itemY);
    doc.text('Score', 520, itemY);

    // Ligne de séparation
    doc.moveTo(50, itemY + 15).lineTo(570, itemY + 15).stroke();

    // Données du tableau
    let y = itemY + 25;
    amlAlerts.forEach(alert => {
      doc.text(alert.id.substring(0, 8) + '...', 50, y);
      doc.text(alert.client?.name || 'N/A', 150, y);
      doc.text(alert.type, 350, y);
      doc.text(alert.severity, 450, y);
      doc.text(alert.riskScore.toString(), 520, y);
      y += 20;
    });
  }

  /**
   * Récupérer les données KYC filtrées
   */
  private async getKycData(filters: ReportFilters): Promise<KycRecord[]> {
    const query = this.kycRecordRepository
      .createQueryBuilder('kyc')
      .leftJoinAndSelect('kyc.client', 'client')
      .orderBy('kyc.createdAt', 'DESC');

    if (filters.startDate) {
      query.andWhere('kyc.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('kyc.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.clientId) {
      query.andWhere('kyc.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters.status) {
      query.andWhere('kyc.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  /**
   * Récupérer les données AML filtrées
   */
  private async getAmlData(filters: ReportFilters): Promise<AmlAlert[]> {
    const query = this.amlAlertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.client', 'client')
      .orderBy('alert.createdAt', 'DESC');

    if (filters.startDate) {
      query.andWhere('alert.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('alert.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters.clientId) {
      query.andWhere('alert.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters.status) {
      query.andWhere('alert.status = :status', { status: filters.status });
    }

    if (filters.type) {
      query.andWhere('alert.type = :type', { type: filters.type });
    }

    return query.getMany();
  }
}
