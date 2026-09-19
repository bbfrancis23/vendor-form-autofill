import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from './extraction.service';
import { ConfigService } from '@nestjs/config';

describe('ExtractionService', () => {
  let service: ExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractionService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => 'test-key',
            get: (_key: string, fallback?: string) => fallback,
          },
        },
      ],
    }).compile();

    service = module.get<ExtractionService>(ExtractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
