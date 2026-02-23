import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PepService } from './pep.service';
import { PepController } from './pep.controller';

@Module({
  imports: [HttpModule],
  controllers: [PepController],
  providers: [PepService],
  exports: [PepService],
})
export class PepModule {}
