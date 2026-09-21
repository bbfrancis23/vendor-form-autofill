import { Module } from '@nestjs/common';
import {
  EXTRACTION_ENABLED,
  EXTRACTION_ENABLED_TOKEN,
} from './extraction.config';
import { ExtractionController } from './extraction.controller';
import { ExtractionService } from './extraction.service';

@Module({
  controllers: [ExtractionController],
  providers: [
    ExtractionService,
    { provide: EXTRACTION_ENABLED_TOKEN, useValue: EXTRACTION_ENABLED },
  ],
})
export class ExtractionModule {}
