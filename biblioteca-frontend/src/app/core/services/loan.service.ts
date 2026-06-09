import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loan, LoanRequest, LoanStatus } from '../models/loan.model';
import { Page, PageParams } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/loans`;

  getAll(params: PageParams & { status?: LoanStatus } = {}): Observable<Page<Loan>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10)
      .set('sortBy', params.sortBy ?? 'loanDate')
      .set('sortDir', params.sortDir ?? 'desc');

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<Page<Loan>>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<Loan> {
    return this.http.get<Loan>(`${this.baseUrl}/${id}`);
  }

  create(request: LoanRequest): Observable<Loan> {
    return this.http.post<Loan>(this.baseUrl, request);
  }

  update(id: number, request: LoanRequest): Observable<Loan> {
    return this.http.put<Loan>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  returnBook(id: number, loanRequest: LoanRequest): Observable<Loan> {
    return this.update(id, { ...loanRequest, status: 'RETURNED' });
  }
}
