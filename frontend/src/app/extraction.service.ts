import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtractionResult } from './extraction.types';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ExtractionService {
  private readonly http = inject(HttpClient);

  //** Sends the posted text to the backend and returns the extracted fields. */
  extract(text: string): Observable<ExtractionResult> {
    return this.http.post<ExtractionResult>(`${API_BASE_URL}/extract`, { text });
  }
}
