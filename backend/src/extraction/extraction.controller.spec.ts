import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionController } from './extraction.controller';
import { ExtractionService } from './extraction.service';

describe('ExtractionController', () => {
  let controller: ExtractionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtractionController],
      providers: [ExtractionService],
    }).compile();

    controller = module.get<ExtractionController>(ExtractionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
