import { Component, signal } from '@angular/core';
import { DocumentInput } from './document-input/document-input.component';

@Component({
  imports: [DocumentInput],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App {
  protected readonly title = signal('Vendor Form Autofill');

  protected onExtract(text: string): void {
    // Temporary: #11 replaces this with the real API call.
    console.log('Extract requested, characters:', text.length);
  }
}
