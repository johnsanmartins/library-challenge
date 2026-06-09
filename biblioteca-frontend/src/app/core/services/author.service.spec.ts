import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthorService } from './author.service';
import { environment } from '../../../environments/environment';
import { Author } from '../models/author.model';
import { Page } from '../models/page.model';

describe('AuthorService', () => {
  let service: AuthorService;
  let httpMock: HttpTestingController;

  const mockAuthor: Author = {
    id: 1, firstName: 'Gabriel', lastName: 'García Márquez', nationality: 'Colombian'
  };

  const mockPage: Page<Author> = {
    content: [mockAuthor], totalElements: 1, totalPages: 1,
    size: 10, number: 0, first: true, last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthorService]
    });
    service = TestBed.inject(AuthorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll should call GET /authors', () => {
    service.getAll().subscribe(page => {
      expect(page.content[0].lastName).toBe('García Márquez');
    });
    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/authors`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getById should return author', () => {
    service.getById(1).subscribe(a => expect(a.firstName).toBe('Gabriel'));
    const req = httpMock.expectOne(`${environment.apiUrl}/authors/1`);
    req.flush(mockAuthor);
  });

  it('create should POST new author', () => {
    const request = { firstName: 'Gabriel', lastName: 'García Márquez', nationality: 'Colombian' };
    service.create(request).subscribe(a => expect(a.id).toBe(1));
    const req = httpMock.expectOne(`${environment.apiUrl}/authors`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthor);
  });

  it('update should PUT author', () => {
    const request = { firstName: 'Gabriel', lastName: 'García Márquez', nationality: 'Colombian' };
    service.update(1, request).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/authors/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockAuthor);
  });

  it('delete should DELETE author', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/authors/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
