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
}
