import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientListComponent } from './client-list.component';
import { ClientService } from '../../../core/services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Client } from '../../../core/models/client.model';
import { Page } from '../../../core/models/page.model';

const mockClient: Client = {
  id: 1, firstName: 'Carlos', lastName: 'Rodríguez',
  email: 'carlos@example.com', phone: '+56912345678',
  registrationDate: '2024-01-15'
};
const mockPage: Page<Client> = {
  content: [mockClient], totalElements: 1, totalPages: 1,
  size: 10, number: 0, first: true, last: true
};

describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let clientServiceMock: jest.Mocked<ClientService>;
  let dialogMock: jest.Mocked<MatDialog>;
  let snackBarMock: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    clientServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockPage)),
      delete: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<ClientService>;

    dialogMock = { open: jest.fn() } as unknown as jest.Mocked<MatDialog>;
    snackBarMock = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [ClientListComponent, NoopAnimationsModule],
      providers: [
        { provide: ClientService, useValue: clientServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load clients on init', () => {
    expect(clientServiceMock.getAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.totalElements()).toBe(1);
  });

  it('should open create dialog', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openCreateDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should reload when create dialog returns true', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    clientServiceMock.getAll.mockClear();
    component.openCreateDialog();
    expect(clientServiceMock.getAll).toHaveBeenCalled();
  });

  it('should open edit dialog with client data', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openEditDialog(mockClient);
    expect(dialogMock.open).toHaveBeenCalledWith(expect.anything(),
      expect.objectContaining({ data: { client: mockClient } }));
  });

  it('should delete client after confirm', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    component.openDeleteDialog(mockClient);
    expect(clientServiceMock.delete).toHaveBeenCalledWith(1);
  });

  it('should not delete when cancelled', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openDeleteDialog(mockClient);
    expect(clientServiceMock.delete).not.toHaveBeenCalled();
  });

  it('should show error on delete fail', () => {
    dialogMock.open.mockReturnValue({ afterClosed: () => of(true) } as any);
    clientServiceMock.delete.mockReturnValue(throwError(() => ({ error: { message: 'Cannot delete' } })));
    component.openDeleteDialog(mockClient);
    expect(snackBarMock.open).toHaveBeenCalledWith('Cannot delete', 'Cerrar', expect.any(Object));
  });

  it('should update page params on page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 20 });
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(5);
  });

  it('should update sort params', () => {
    component.onSortChange({ active: 'email', direction: 'desc' });
    expect(component.sortBy).toBe('email');
    expect(component.sortDir).toBe('desc');
  });

  it('should show error when load fails', () => {
    clientServiceMock.getAll.mockReturnValue(throwError(() => new Error()));
    component.loadClients();
    expect(snackBarMock.open).toHaveBeenCalledWith('Error al cargar los clientes', 'Cerrar', expect.any(Object));
  });

  it('should debounce search input', fakeAsync(() => {
    clientServiceMock.getAll.mockClear();
    component.onSearch('Carlos');
    tick(400);
    expect(clientServiceMock.getAll).toHaveBeenCalled();
  }));
});
