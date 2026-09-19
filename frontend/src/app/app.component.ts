import { Component, signal } from '@angular/core';
import { DocumentInput } from './document-input/document-input.component';
import { ExtractionForm } from './extraction-form/extraction-form.component';
import { ExtractionResult } from './extraction.types';
import { SAMPLE_RESULT } from './sample-result';

@Component({
  imports: [DocumentInput, ExtractionForm],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App {
  protected readonly title = signal('Vendor Form Autofill');

  // Temporary: shows sample data until #11 fills this from the API.
  protected readonly result = signal<ExtractionResult | null>(SAMPLE_RESULT);

  protected onExtract(text: string): void {
    // Temporary: #11 replaces this with the real API call.
    console.log('Extract requested, characters:', text.length);
  }
}
