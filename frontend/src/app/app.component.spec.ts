import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { ExtractionResult } from './extraction.types';

const RESULT: ExtractionResult = {
  businessName: { value: 'Acme LLC', confidence: 'high' },
  taxId: { value: '12-3456789', confidence: 'high' },
  addressStreet: { value: '1 Main St', confidence: 'high' },
  addressCity: { value: 'Springfield', confidence: 'medium' },
  addressState: { value: 'IL', confidence: 'high' },
  addressPostalCode: { value: null, confidence: 'low' },
  phone: { value: '(555) 010-4477', confidence: 'low' },
};

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;

  // Types into the textarea the way a user does.
  function typeText(value: string): void {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = value;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function clickExtract(): void {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Vendor Form Autofill');
  });

  it('shows no form until an extraction has run', () => {
    expect(fixture.nativeElement.querySelector('app-extraction-form')).toBeNull();
  });

  it('sends the text to the API and shows the pre-filled form', () => {
    typeText('Acme LLC');
    clickExtract();

    const request = http.expectOne('/api/extract');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ text: 'Acme LLC' });

    request.flush(RESULT);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-extraction-form input').length).toBe(7);
    const name = fixture.nativeElement.querySelector('#businessName') as HTMLInputElement;
    expect(name.value).toBe('Acme LLC');
  });

  it('shows a loading state while waiting for the API', () => {
    typeText('Acme LLC');
    clickExtract();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Extracting');

    http.expectOne('/api/extract').flush(RESULT);
  });

  it("shows the API's own message when the request fails", () => {
    typeText('Acme LLC');
    clickExtract();

    http.expectOne('/api/extract').flush(
      {
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'The extraction service is busy. Please try again shortly.',
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('busy');
    expect(fixture.nativeElement.querySelector('app-extraction-form')).toBeNull();
  });

  it('shows a friendly message when the server cannot be reached', () => {
    typeText('Acme LLC');
    clickExtract();

    http.expectOne('/api/extract').flush('Bad Gateway', {
      status: 502,
      statusText: 'Bad Gateway',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'could not be reached',
    );
  });
});
