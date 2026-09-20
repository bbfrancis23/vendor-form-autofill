import { Component, computed, input, linkedSignal, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ExtractionResult, FieldKey, FormValues } from '../extraction.types';
import { FIELD_CONFIG } from '../extraction-fields';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-extraction-form',
  styleUrl: './extraction-form.component.scss',
  templateUrl: './extraction-form.component.html',
})
export class ExtractionForm {
  /** The fields returned by the API. A new value rebuilds the form.  */
  readonly result = input.required<ExtractionResult>();

  /** Emits the final values when the user submits a valid form. */
  readonly submitted = output<FormValues>();

  readonly fields = FIELD_CONFIG;

  /** Derived from the result, so a new result gives a fresh, pre-filled form. */
  readonly form = computed(() => {
    const result = this.result();
    const controls = {} as Record<FieldKey, FormControl<string>>;
    for (const field of FIELD_CONFIG) {
      const validators: ValidatorFn[] = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      controls[field.key] = new FormControl(result[field.key].value ?? '', {
        nonNullable: true,
        validators,
      });
    }
    return new FormGroup(controls);
  });

  /** True after the user clicks Submit; goes back to false when a new result arrives. */
  readonly submitAttempted = linkedSignal(() => {
    this.result();
    return false;
  });

  /** Returns true for fields AI was not sure about, until the user edits them. */
  needsReview(key: FieldKey): boolean {
    const notSure = this.result()[key].confidence !== 'high';
    return notSure && !this.form().controls[key].dirty;
  }

  /** This note is shown under a flagged field. */
  reviewMessage(key: FieldKey): string {
    const field = this.result()[key];
    if (field.value === null) {
      return 'Not found in the document - please fill this in';
    }

    return field.confidence === 'low'
      ? 'Low confidence - please check this value'
      : 'Medium confidence - please double-check this value';
  }

  /** Errors show once a field was touched, or after the first Submit attempt. */
  showError(key: FieldKey): boolean {
    const control = this.form().controls[key];
    return control.invalid && (control.touched || this.submitAttempted());
  }

  errorMessage(key: FieldKey): string {
    const config = FIELD_CONFIG.find((field) => field.key === key)!;
    const control = this.form().controls[key];
    if (control.hasError('required')) {
      return `${config.label} is required`;
    }
    return config.patternMessage ?? 'This value is not valid';
  }

  /** Which note or error a screen reader should read with the field. */
  describedBy(key: FieldKey): string | null {
    if (this.showError(key)) {
      return `${key}-error`;
    }
    return this.needsReview(key) ? `${key}-note` : null;
  }

  onSubmit(): void {
    this.submitAttempted.set(true);
    const form = this.form();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.submitted.emit(form.getRawValue());
  }
}
