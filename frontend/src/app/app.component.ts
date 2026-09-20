import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DocumentInput } from './document-input/document-input.component';
import { ExtractionForm } from './extraction-form/extraction-form.component';
import { ExtractionService } from './extraction.service';
import { ExtractionResult } from './extraction.types';

@Component({
  imports: [DocumentInput, ExtractionForm],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App {
  private readonly extractionService = inject(ExtractionService);

  protected readonly title = signal('Vendor Form Autofill');
  protected readonly result = signal<ExtractionResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onExtract(text: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.extractionService.extract(text).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.messageFor(error));
        this.loading.set(false);
      },
    });
  }

  /** Turns an HTTP failure into something a vendor can act on. */
  private messageFor(error: HttpErrorResponse): string {
    // Our API always sends { statusCode, error, message } with a readable message.
    const serverMessage = error.error?.message;
    if (typeof serverMessage === 'string') {
      return serverMessage;
    }
    if (error.status === 0 || error.status >= 502) {
      return 'The server could not be reached. Please try again in a moment.';
    }
    return 'Something went wrong. Please try again.';
  }
}
