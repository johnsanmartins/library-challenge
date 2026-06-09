import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';
import { Page } from '../models/page.model';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const mockBook: Book = {
    id: 1, title: 'Clean Code', isbn: '978-0132350884', availableCopies: 3
  };

  const mockPage: Page<Book> = {
    content: [mockBook], totalElements: 1, totalPages: 1,
    size: 10, number: 0, first: true, last: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookService]
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should call GET /books with default params', () => {
    service.getAll().subscribe(page => {
      expect(page.content.length).toBe(1);
      expect(page.content[0].title).toBe('Clean Code');
    });

    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/books`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(mockPage);
  });

  it('getAll with search should include search param', () => {
    service.getAll({ search: 'Clean' }).subscribe();

    const req = httpMock.expectOne(r => r.url === `${environment.apiUrl}/books`);
    expect(req.request.params.get('search')).toBe('Clean');
    req.flush(mockPage);
  });

  it('getById should call GET /books/:id', () => {
    service.getById(1).subscribe(book => {
      expect(book.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBook);
  });

  it('create should call POST /books', () => {
    const request = { title: 'New Book', availableCopies: 1 };
    service.create(request).subscribe(book => {
      expect(book.title).toBe('Clean Code');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/books`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockBook);
  });

  it('update should call PUT /books/:id', () => {
    const request = { title: 'Updated', availableCopies: 2 };
    service.update(1, request).subscribe(book => {
      expect(book.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockBook);
  });

  it('delete should call DELETE /books/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
