import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { EXTRACTION_ENABLED_TOKEN } from './extraction.config';
import { ExtractionService } from './extraction.service';

async function createService(enabled: boolean): Promise<ExtractionService> {
  const module = await Test.createTestingModule({
    providers: [
      ExtractionService,
      {
        provide: ConfigService,
        useValue: {
          getOrThrow: () => 'test-key',
          get: (_key: string, fallback?: string) => fallback,
        },
      },
      { provide: EXTRACTION_ENABLED_TOKEN, useValue: enabled },
    ],
  }).compile();

  return module.get(ExtractionService);
}

describe('ExtractionService', () => {
  it('should be defined', async () => {
    expect(await createService(true)).toBeDefined();
  });

  it('refuses to call Claude while extraction is turned off', async () => {
    const service = await createService(false);

    await expect(service.extractText('Acme LLC')).rejects.toThrow(
      new ServiceUnavailableException('Extraction is turned off right now.'),
    );
  });
});
