import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthorListComponent } from './author-list.component';
import { AuthorService } from '../../../core/services/author.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Author } from '../../../core/models/author.model';
import { Page } from '../../../core/models/page.model';

const mockAuthor: Author = { id: 1, firstName: 'Gabriel', lastName: 'García Márquez', nationality: 'Colombian', birthDate: '1927-03-06' };
const mockPage: Page<Author> = {
  content: [mockAuthor], totalElements: 1, totalPages: 1,
  size: 10, number: 0, first: true, last: true
};

describe('AuthorListComponent', () => {
  let component: AuthorListComponent;
  let fixture: ComponentFixture<AuthorListComponent>;
  let authorServiceMock: jest.Mocked<AuthorService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    authorServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockPage)),
      delete: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<AuthorService>;

    dialogMock = { open: jest.fn() } as unknown as jest.Mocked<MatDialog>;
    snackBarMock = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [AuthorListComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthorService, useValue: authorServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load authors on init', () => {
    expect(authorServiceMock.getAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('should show loading while fetching', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should show error when load fails', () => {
    authorServiceMock.getAll.mockReturnValue(throwError(() => new Error('fail')));
    component.loadAuthors();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar los autores', 'Cerrar', expect.any(Object));
  });

  it('should open create dialog', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openCreateDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should reload after create dialog returns true', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    authorServiceMock.getAll.mockClear();
    component.openCreateDialog();
    expect(authorServiceMock.getAll).toHaveBeenCalled();
  });

  it('should open edit dialog with author data', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openEditDialog(mockAuthor);
    expect(dialogMock.open).toHaveBeenCalledWith(expect.anything(),
      expect.objectContaining({ data: { author: mockAuthor } }));
  });

  it('should reload after edit dialog returns true', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    authorServiceMock.getAll.mockClear();
    component.openEditDialog(mockAuthor);
    expect(authorServiceMock.getAll).toHaveBeenCalled();
  });

  it('should delete author after confirm', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    component.openDeleteDialog(mockAuthor);
    expect(authorServiceMock.delete).toHaveBeenCalledWith(1);
    expect(snackBarMock.open).toHaveBeenCalledWith('Autor eliminado', 'Cerrar', expect.any(Object));
  });

  it('should not delete when cancelled', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openDeleteDialog(mockAuthor);
    expect(authorServiceMock.delete).not.toHaveBeenCalled();
  });

  it('should show error on delete fail', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    authorServiceMock.delete.mockReturnValue(throwError(() => ({ error: { message: 'Cannot delete' } })));
    component.openDeleteDialog(mockAuthor);
    expect(snackBarMock.open).toHaveBeenCalledWith('Cannot delete', 'Cerrar', expect.any(Object));
  });

  it('should update page params on page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 20 });
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });

  it('should update sort params', () => {
    component.onSortChange({ active: 'firstName', direction: 'asc' });
    expect(component.sortBy).toBe('firstName');
    expect(component.sortDir).toBe('asc');
  });

  it('should debounce search input', fakeAsync(() => {
    authorServiceMock.getAll.mockClear();
    component.onSearch('García');
    tick(400);
    expect(authorServiceMock.getAll).toHaveBeenCalled();
  }));
});
