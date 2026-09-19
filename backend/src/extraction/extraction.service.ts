import { Injectable } from '@nestjs/common';

@Injectable()
export class ExtractionService {
  extractText(text: string) {
    return {
      receivedCharacters: text.length,
      message: 'stub: the Claude call is added in issue #4',
    };
  }
}
