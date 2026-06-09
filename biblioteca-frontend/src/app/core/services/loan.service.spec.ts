import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoanService } from './loan.service';
import { environment } from '../../../environments/environment';
import { Loan } from '../models/loan.model';
import { Page } from '../models/page.model';

describe('LoanService', () => {
  let service: LoanService;
  let httpMock: HttpTestingController;

  const mockLoan: Loan = {
    id: 1,
    book: { id: 1, title: 'Clean Code', availableCopies: 2 },
    client: { id: 1, firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos@example.com' },
    loanDate: '2026-05-01',
    dueDate: '2026-06-01',
    status: 'ACTIVE'
  };

  const mockPage: Page<Loan> = {
    content: [mockLoan], totalElements: 1, totalPages: 1,
    size: 10, number: 0, first: true, last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LoanService]
    });
    service = TestBed.inject(LoanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll should call GET /loans', () => {
    service.getAll().subscribe(page => {
      expect(page.content[0].status).toBe('ACTIVE');
    });
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/loans`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getAll with status filter should include status param', () => {
    service.getAll({ status: 'ACTIVE' }).subscribe();
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/loans`);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    req.flush(mockPage);
  });

  it('getById should call GET /loans/:id', () => {
    service.getById(1).subscribe(l => expect(l.status).toBe('ACTIVE'));
    const req = httpMock.expectOne(`${environment.apiUrl}/loans/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLoan);
  });

  it('create should call POST /loans', () => {
    const request = { bookId: 1, clientId: 1, dueDate: '2026-06-15' };
    service.create(request).subscribe(l => expect(l.id).toBe(1));
    const req = httpMock.expectOne(`${environment.apiUrl}/loans`);
    expect(req.request.method).toBe('POST');
    req.flush(mockLoan);
  });

  it('returnBook should call PUT /loans/:id with RETURNED status', () => {
    const request = { bookId: 1, clientId: 1, dueDate: '2026-06-01', status: 'RETURNED' as const };
    service.returnBook(1, request).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/loans/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.status).toBe('RETURNED');
    req.flush({ ...mockLoan, status: 'RETURNED' });
  });

  it('delete should call DELETE /loans/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/loans/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
