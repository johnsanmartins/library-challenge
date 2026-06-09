import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Author, AuthorRequest } from '../models/author.model';
import { Page, PageParams } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/authors`;

  getAll(params: PageParams = {}): Observable<Page<Author>> {
    let httpParams = new HttpParams()
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10)
      .set('sortBy', params.sortBy ?? 'lastName')
      .set('sortDir', params.sortDir ?? 'asc');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<Page<Author>>(this.baseUrl, { params: httpParams });
  }

  getById(id: number): Observable<Author> {
    return this.http.get<Author>(`${this.baseUrl}/${id}`);
  }

  create(request: AuthorRequest): Observable<Author> {
    return this.http.post<Author>(this.baseUrl, request);
  }

  update(id: number, request: AuthorRequest): Observable<Author> {
    return this.http.put<Author>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
