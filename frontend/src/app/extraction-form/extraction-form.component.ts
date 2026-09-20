import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExtractionResult, FieldKey } from '../extraction.types';
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
  readonly fields = FIELD_CONFIG;

  /** Derived from the result, so a new result gives a fresh, pre-filled form. */
  readonly form = computed(() => {
    const result = this.result();
    const controls = {} as Record<FieldKey, FormControl<string>>;
    for (const field of FIELD_CONFIG) {
      controls[field.key] = new FormControl(result[field.key].value ?? '', {
        nonNullable: true,
      });
    }
    return new FormGroup(controls);
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
      return 'Not found in the Document - please fill this in';
    }

    return field.confidence === 'low'
      ? 'Low confidence - please check this value'
      : 'Medium confidence - please double-check this value';
  }
}
