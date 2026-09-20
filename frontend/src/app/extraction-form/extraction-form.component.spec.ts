import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtractionResult } from '../extraction.types';
import { ExtractionForm } from './extraction-form.component';

const RESULT: ExtractionResult = {
  businessName: { value: 'Acme LLC', confidence: 'high' },
  taxId: { value: '12-3456789', confidence: 'high' },
  addressStreet: { value: '1 Main St', confidence: 'high' },
  addressCity: { value: 'Springfield', confidence: 'medium' },
  addressState: { value: 'IL', confidence: 'high' },
  addressPostalCode: { value: null, confidence: 'low' },
  phone: { value: '(555) 010-4477', confidence: 'low' },
};

describe('ExtractionForm', () => {
  let fixture: ComponentFixture<ExtractionForm>;

  function inputById(id: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtractionForm);
    fixture.componentRef.setInput('result', RESULT);
    fixture.detectChanges();
  });

  it('renders one labelled input per field', () => {
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(7);

    const labels = Array.from<HTMLLabelElement>(
      fixture.nativeElement.querySelectorAll('label'),
    ).map((label) => label.textContent?.trim());
    expect(labels).toContain('Business name');
    expect(labels).toContain('Phone');
  });

  it('pre-fills the inputs from the result and leaves missing values empty', () => {
    expect(inputById('businessName').value).toBe('Acme LLC');
    expect(inputById('addressCity').value).toBe('Springfield');
    expect(inputById('addressPostalCode').value).toBe('');
  });

  it('lets the user edit a field', () => {
    const input = inputById('businessName');
    input.value = 'Acme Inc.';
    input.dispatchEvent(new Event('input'));

    expect(fixture.componentInstance.form().controls.businessName.value).toBe('Acme Inc.');
  });

  it('rebuilds the form when a new result arrives', () => {
    fixture.componentRef.setInput('result', {
      ...RESULT,
      businessName: { value: 'Other Co', confidence: 'high' },
    });
    fixture.detectChanges();

    expect(inputById('businessName').value).toBe('Other Co');
  });

  it('flags every field that is not high confidence', () => {
    const flagged = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.needs-review'),
    ).map((field) => field.querySelector('input')?.id);

    expect(flagged).toEqual(['addressCity', 'addressPostalCode', 'phone']);
  });

  it('says when a value was not found in the document', () => {
    const note = fixture.nativeElement.querySelector('#addressPostalCode-note') as HTMLElement;
    expect(note.textContent).toContain('Not found');
  });

  it('clears the flag once the user edits the field', () => {
    const input = inputById('phone');
    input.value = '(555) 010-9999';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#phone-note')).toBeNull();
    expect(fixture.nativeElement.querySelector('#addressCity-note')).not.toBeNull();
  });
});
