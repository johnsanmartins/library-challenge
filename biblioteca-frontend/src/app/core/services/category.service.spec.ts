import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest } from '../models/category.model';
import { Page } from '../models/page.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/categories`;

  const mockCategory: Category = { id: 1, name: 'Fiction' };
  const mockPage: Page<Category> = {
    content: [mockCategory], totalElements: 1, totalPages: 1,
    size: 100, number: 0, first: true, last: true
  };
  const mockRequest: CategoryRequest = { name: 'Fiction' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAll should call GET /categories with size=100', () => {
    service.getAll().subscribe(page => expect(page.content.length).toBe(1));
    const req = httpMock.expectOne(r => r.url === baseUrl && r.params.get('size') === '100');
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('create should call POST /categories', () => {
    service.create(mockRequest).subscribe(c => expect(c.id).toBe(1));
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockCategory);
  });

  it('update should call PUT /categories/:id', () => {
    service.update(1, mockRequest).subscribe(c => expect(c.name).toBe('Fiction'));
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCategory);
  });

  it('delete should call DELETE /categories/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
