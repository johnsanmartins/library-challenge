import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanListComponent } from './loan-list.component';
import { LoanService } from '../../../core/services/loan.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Loan } from '../../../core/models/loan.model';
import { Page } from '../../../core/models/page.model';

const mockLoan: Loan = {
  id: 1,
  book: { id: 1, title: 'Clean Code', availableCopies: 2 },
  client: { id: 1, firstName: 'Carlos', lastName: 'Rodríguez', email: 'carlos@example.com' },
  loanDate: '2026-05-01', dueDate: '2026-06-01', status: 'ACTIVE'
};

const mockPage: Page<Loan> = {
  content: [mockLoan], totalElements: 1, totalPages: 1,
  size: 10, number: 0, first: true, last: true
};

describe('LoanListComponent', () => {
  let component: LoanListComponent;
  let fixture: ComponentFixture<LoanListComponent>;
  let loanServiceMock: jest.Mocked<LoanService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    loanServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockPage)),
      delete: jest.fn().mockReturnValue(of(undefined)),
      returnBook: jest.fn().mockReturnValue(of({ ...mockLoan, status: 'RETURNED' }))
    } as unknown as jest.Mocked<LoanService>;

    dialogMock = { open: jest.fn() } as unknown as jest.Mocked<MatDialog>;
    snackBarMock = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [LoanListComponent, NoopAnimationsModule],
      providers: [
        { provide: LoanService, useValue: loanServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load loans on init', () => {
    expect(loanServiceMock.getAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should open create dialog', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openCreateDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should return book after confirm', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    component.openReturnDialog(mockLoan);
    expect(loanServiceMock.returnBook).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'RETURNED' }));
    expect(snackBarMock.open).toHaveBeenCalledWith('Libro devuelto', 'Cerrar', expect.any(Object));
  });

  it('should not return when cancelled', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openReturnDialog(mockLoan);
    expect(loanServiceMock.returnBook).not.toHaveBeenCalled();
  });

  it('should delete loan after confirm', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    component.openDeleteDialog(mockLoan);
    expect(loanServiceMock.delete).toHaveBeenCalledWith(1);
  });

  it('should filter by status', () => {
    loanServiceMock.getAll.mockClear();
    component.statusFilter = 'ACTIVE';
    component.onStatusChange();
    expect(loanServiceMock.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' })
    );
  });

  it('getStatusClass should return correct class', () => {
    expect(component.getStatusClass('ACTIVE')).toBe('chip-active');
    expect(component.getStatusClass('RETURNED')).toBe('chip-returned');
    expect(component.getStatusClass('OVERDUE')).toBe('chip-overdue');
  });

  it('should show error when load fails', () => {
    loanServiceMock.getAll.mockReturnValue(throwError(() => new Error()));
    component.loadLoans();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar los préstamos', 'Cerrar', expect.any(Object));
  });

  it('should show error when return fails', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    loanServiceMock.returnBook.mockReturnValue(
      throwError(() => ({ error: { message: 'Already returned' } }))
    );
    component.openReturnDialog(mockLoan);
    expect(snackBarMock.open).toHaveBeenCalledWith('Already returned', 'Cerrar', expect.any(Object));
  });
});
