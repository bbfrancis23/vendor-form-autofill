import { Controller, Post, Body } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { ExtractRequestDto } from './dto/extract-request.dto';

@Controller('extract')
export class ExtractionController {
  constructor(private readonly extractionService: ExtractionService) {}

  @Post()
  extract(@Body() dto: ExtractRequestDto) {
    return this.extractionService.extractText(dto.text);
  }
}
