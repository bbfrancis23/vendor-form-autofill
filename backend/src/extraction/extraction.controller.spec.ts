import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionController } from './extraction.controller';
import { ExtractionService } from './extraction.service';
import { ConfigService } from '@nestjs/config';

describe('ExtractionController', () => {
  let controller: ExtractionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtractionController],
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

    controller = module.get<ExtractionController>(ExtractionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
