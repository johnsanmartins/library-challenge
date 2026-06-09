import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookListComponent } from './book-list.component';
import { BookService } from '../../../core/services/book.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Book } from '../../../core/models/book.model';
import { Page } from '../../../core/models/page.model';

const mockBook: Book = { id: 1, title: 'Clean Code', isbn: '978-0132350884', availableCopies: 3 };
const mockPage: Page<Book> = {
  content: [mockBook], totalElements: 1, totalPages: 1,
  size: 10, number: 0, first: true, last: true
};

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let bookServiceMock: jest.Mocked<BookService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    bookServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockPage)),
      delete: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<BookService>;

    dialogMock = { open: jest.fn() } as unknown as jest.Mocked<MatDialog>;
    snackBarMock = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [BookListComponent, NoopAnimationsModule],
      providers: [
        { provide: BookService, useValue: bookServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load books on init', () => {
    expect(bookServiceMock.getAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('should show loading while fetching', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should open create dialog on button click', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openCreateDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should reload after dialog closes with result', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    bookServiceMock.getAll.mockClear();
    component.openCreateDialog();
    expect(bookServiceMock.getAll).toHaveBeenCalled();
  });

  it('should open edit dialog', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openEditDialog(mockBook);
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should delete book after confirm', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    component.openDeleteDialog(mockBook);
    expect(bookServiceMock.delete).toHaveBeenCalledWith(1);
    expect(snackBarMock.open).toHaveBeenCalledWith('Libro eliminado', 'Cerrar', expect.any(Object));
  });

  it('should not delete when dialog cancelled', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openDeleteDialog(mockBook);
    expect(bookServiceMock.delete).not.toHaveBeenCalled();
  });

  it('should show error when load fails', () => {
    bookServiceMock.getAll.mockReturnValue(throwError(() => new Error('fail')));
    component.loadBooks();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar los libros', 'Cerrar', expect.any(Object));
  });

  it('getAuthorNames should return formatted names', () => {
    const book: Book = {
      ...mockBook,
      authors: [{ id: 1, firstName: 'Robert', lastName: 'Martin' }]
    };
    expect(component.getAuthorNames(book)).toBe('Robert Martin');
  });

  it('getAuthorNames should return dash when no authors', () => {
    expect(component.getAuthorNames(mockBook)).toBe('—');
  });

  it('should update sort on sortChange', () => {
    component.onSortChange({ active: 'isbn', direction: 'desc' });
    expect(component.sortBy).toBe('isbn');
    expect(component.sortDir).toBe('desc');
  });

  it('should update page on pageChange', () => {
    component.onPageChange({ pageIndex: 2, pageSize: 25, length: 100 });
    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(25);
  });

  it('should debounce search', fakeAsync(() => {
    bookServiceMock.getAll.mockClear();
    component.onSearch('Clean');
    tick(400);
    expect(bookServiceMock.getAll).toHaveBeenCalled();
  }));
});
