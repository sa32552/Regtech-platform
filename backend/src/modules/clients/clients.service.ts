import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, ClientType, ClientStatus, RiskLevel } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Check if client with email already exists
    const existingClient = await this.clientRepository.findOne({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    // Create new client
    const newClient = this.clientRepository.create(createClientDto);

    // Set default next KYC review date (1 year from now)
    const nextKycReview = new Date();
    nextKycReview.setFullYear(nextKycReview.getFullYear() + 1);
    newClient.nextKycReview = nextKycReview;

    return this.clientRepository.save(newClient);
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.find({
      relations: ['assignedTo', 'documents'],
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'documents', 'workflowJobs'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async findByEmail(email: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { email },
      relations: ['assignedTo', 'documents'],
    });

    if (!client) {
      throw new NotFoundException(`Client with email ${email} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async updateRiskScore(id: string, riskScore: number): Promise<Client> {
    const client = await this.findOne(id);

    // Update risk score
    client.riskScore = riskScore;

    // Update risk level based on score
    if (riskScore >= 80) {
      client.riskLevel = RiskLevel.CRITICAL;
    } else if (riskScore >= 60) {
      client.riskLevel = RiskLevel.HIGH;
    } else if (riskScore >= 40) {
      client.riskLevel = RiskLevel.MEDIUM;
    } else {
      client.riskLevel = RiskLevel.LOW;
    }

    return this.clientRepository.save(client);
  }

  async updateKycData(id: string, kycData: Record<string, any>): Promise<Client> {
    const client = await this.findOne(id);
    client.kycData = { ...client.kycData, ...kycData };
    client.lastKycReview = new Date();

    // Set next KYC review date (1 year from now)
    const nextKycReview = new Date();
    nextKycReview.setFullYear(nextKycReview.getFullYear() + 1);
    client.nextKycReview = nextKycReview;

    return this.clientRepository.save(client);
  }

  async updateAmlData(id: string, amlData: Record<string, any>): Promise<Client> {
    const client = await this.findOne(id);
    client.amlData = { ...client.amlData, ...amlData };
    return this.clientRepository.save(client);
  }

  async updateStatus(id: string, status: ClientStatus): Promise<Client> {
    const client = await this.findOne(id);
    client.status = status;
    return this.clientRepository.save(client);
  }

  async assignToUser(id: string, userId: string): Promise<Client> {
    const client = await this.findOne(id);
    client.assignedToId = userId;
    return this.clientRepository.save(client);
  }

  async getClientsByRiskLevel(riskLevel: RiskLevel): Promise<Client[]> {
    return this.clientRepository.find({
      where: { riskLevel },
      relations: ['assignedTo', 'documents'],
    });
  }

  async getClientsByStatus(status: ClientStatus): Promise<Client[]> {
    return this.clientRepository.find({
      where: { status },
      relations: ['assignedTo', 'documents'],
    });
  }

  async getClientsDueForKycReview(): Promise<Client[]> {
    const today = new Date();
    return this.clientRepository
      .createQueryBuilder('client')
      .where('client.nextKycReview <= :today', { today })
      .andWhere('client.status != :closedStatus', { closedStatus: ClientStatus.CLOSED })
      .getMany();
  }
}
