import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentInput } from './document-input.component';

describe('DocumentInput', () => {
  let component: DocumentInput;
  let fixture: ComponentFixture<DocumentInput>;
  let button: HTMLButtonElement;

  // Types into the textarea the way a user does: sets the value and fires an "input" event.
  function typeText(value: string): void {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = value;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentInput],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables Extract while the text is empty or only whitespace', () => {
    expect(button.disabled).toBe(true);

    typeText('   ');
    expect(button.disabled).toBe(true);
  });

  it('enables Extract once there is text', () => {
    typeText('Acme LLC');
    expect(button.disabled).toBe(false);
  });

  it('disables Extract while loading', () => {
    typeText('Acme LLC');
    expect(button.disabled).toBe(false);

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });

  it('emits the text when Extract is clicked', () => {
    const emitted: string[] = [];
    component.extract.subscribe((value) => emitted.push(value));

    typeText('Acme LLC');
    button.click();

    expect(emitted).toEqual(['Acme LLC']);
  });
});
