import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtractionResult, FormValues } from '../extraction.types';
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

  // Types into a field and leaves it, the way a user does.
  function typeInto(id: string, value: string): void {
    const input = inputById(id);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function errorFor(id: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`#${id}-error`);
  }

  it('requires a business name', () => {
    typeInto('businessName', '');
    expect(errorFor('businessName')?.textContent).toContain('Business name is required');
  });

  it('rejects a badly formatted tax ID', () => {
    typeInto('taxId', '123');
    expect(errorFor('taxId')?.textContent).toContain('EIN');
  });

  it('accepts an EIN, an SSN and 9 digits as a tax ID', () => {
    for (const value of ['12-3456789', '123-45-6789', '123456789']) {
      typeInto('taxId', value);
      expect(errorFor('taxId')).toBeNull();
    }
  });

  it('rejects a bad ZIP code and a bad phone number', () => {
    typeInto('addressPostalCode', '7870');
    typeInto('phone', '555-0142');
    expect(errorFor('addressPostalCode')).not.toBeNull();
    expect(errorFor('phone')).not.toBeNull();
  });

  it('accepts a valid ZIP code and phone number', () => {
    typeInto('addressPostalCode', '78701-1234');
    typeInto('phone', '(512) 555-0142');
    expect(errorFor('addressPostalCode')).toBeNull();
    expect(errorFor('phone')).toBeNull();
  });

  it('blocks submit and shows errors while the form is invalid', () => {
    const emitted: FormValues[] = [];
    fixture.componentInstance.submitted.subscribe((values) => emitted.push(values));

    const name = inputById('businessName');
    name.value = '';
    name.dispatchEvent(new Event('input'));
    submitForm();

    expect(emitted).toEqual([]);
    expect(errorFor('businessName')).not.toBeNull();
  });

  it('emits the values when a valid form is submitted', () => {
    const emitted: FormValues[] = [];
    fixture.componentInstance.submitted.subscribe((values) => emitted.push(values));

    submitForm();

    expect(emitted.length).toBe(1);
    expect(emitted[0].businessName).toBe('Acme LLC');
    expect(emitted[0].addressPostalCode).toBe('');
  });
});
