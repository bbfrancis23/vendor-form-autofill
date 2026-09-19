import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-document-input',
  styleUrl: './document-input.component.scss',
  templateUrl: './document-input.component.html',
})
export class DocumentInput {
  /** True while a request is in flight; disables the button. */
  readonly loading = input(false);

  /** emits the pasted text when the user clicks Extract. */
  readonly extract = output<string>();

  readonly text = new FormControl('', { nonNullable: true });

  get canExtract(): boolean {
    return !this.loading() && this.text.value.trim().length > 0;
  }

  onExtract(): void {
    if (this.canExtract) {
      this.extract.emit(this.text.value);
    }
  }
}
