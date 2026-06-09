import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { environment } from '../../../environments/environment';
import { Client } from '../models/client.model';
import { Page } from '../models/page.model';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  const mockClient: Client = {
    id: 1, firstName: 'Carlos', lastName: 'Rodríguez',
    email: 'carlos@example.com', phone: '+56912345678'
  };

  const mockPage: Page<Client> = {
    content: [mockClient], totalElements: 1, totalPages: 1,
    size: 10, number: 0, first: true, last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientService]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll should call GET /clients', () => {
    service.getAll().subscribe(page => {
      expect(page.content[0].email).toBe('carlos@example.com');
    });
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/clients`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getAll with search should include search param', () => {
    service.getAll({ search: 'Carlos' }).subscribe();
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/clients`);
    expect(req.request.params.get('search')).toBe('Carlos');
    req.flush(mockPage);
  });

  it('getById should call GET /clients/:id', () => {
    service.getById(1).subscribe(c => expect(c.id).toBe(1));
    const req = httpMock.expectOne(`${environment.apiUrl}/clients/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClient);
  });

  it('create should call POST /clients', () => {
    const request = { firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos@example.com' };
    service.create(request).subscribe(c => expect(c.id).toBe(1));
    const req = httpMock.expectOne(`${environment.apiUrl}/clients`);
    expect(req.request.method).toBe('POST');
    req.flush(mockClient);
  });

  it('update should call PUT /clients/:id', () => {
    const request = { firstName: 'Carlos', lastName: 'Updated', email: 'carlos@example.com' };
    service.update(1, request).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/clients/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockClient);
  });

  it('delete should call DELETE /clients/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/clients/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
