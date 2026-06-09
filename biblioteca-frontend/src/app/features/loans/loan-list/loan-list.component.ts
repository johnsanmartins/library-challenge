import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';

import { LoanService } from '../../../core/services/loan.service';
import { Loan, LoanStatus } from '../../../core/models/loan.model';
import { LoanFormDialogComponent } from '../loan-form-dialog/loan-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule, MatDialogModule,
    MatSnackBarModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    FormsModule, NgIf, NgFor, DatePipe
  ],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.scss'
})
export class LoanListComponent implements OnInit {
  displayedColumns = ['book', 'client', 'loanDate', 'dueDate', 'returnDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<Loan>([]);
  totalElements = signal(0);
  loading = signal(false);

  pageSize = 10;
  pageIndex = 0;
  sortBy = 'loanDate';
  sortDir: 'asc' | 'desc' = 'desc';
  statusFilter: LoanStatus | '' = '';

  readonly statusOptions: Array<{ value: LoanStatus | '', label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'OVERDUE', label: 'Vencido' }
  ];

  readonly statusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    RETURNED: 'Devuelto',
    OVERDUE: 'Vencido'
  };

  constructor(
    private loanService: LoanService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadLoans(); }

  loadLoans(): void {
    this.loading.set(true);
    this.loanService.getAll({
      page: this.pageIndex, size: this.pageSize,
      sortBy: this.sortBy, sortDir: this.sortDir,
      status: this.statusFilter || undefined
    }).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => { this.showError('Error al cargar los préstamos'); this.loading.set(false); }
    });
  }

  onStatusChange(): void { this.pageIndex = 0; this.loadLoans(); }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLoans();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active || 'loanDate';
    this.sortDir = (sort.direction as 'asc' | 'desc') || 'desc';
    this.loadLoans();
  }

  openCreateDialog(): void {
    this.dialog.open(LoanFormDialogComponent, { width: '520px', data: { loan: null } })
      .afterClosed().subscribe(r => { if (r) this.loadLoans(); });
  }

  openReturnDialog(loan: Loan): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `¿Marcar el préstamo de "${loan.book.title}" como devuelto?` }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loanService.returnBook(loan.id, {
          bookId: loan.book.id,
          clientId: loan.client.id,
          dueDate: loan.dueDate,
          status: 'RETURNED'
        }).subscribe({
          next: () => { this.showSuccess('Libro devuelto'); this.loadLoans(); },
          error: (err) => this.showError(err.error?.message || 'Error al devolver el libro')
        });
      }
    });
  }

  openDeleteDialog(loan: Loan): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `¿Eliminar este registro de préstamo?` }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loanService.delete(loan.id).subscribe({
          next: () => { this.showSuccess('Préstamo eliminado'); this.loadLoans(); },
          error: (err) => this.showError(err.error?.message || 'No se puede eliminar el préstamo')
        });
      }
    });
  }

  getStatusClass(status: LoanStatus): string {
    return { ACTIVE: 'chip-active', RETURNED: 'chip-returned', OVERDUE: 'chip-overdue' }[status] ?? '';
  }

  getStatusLabel(status: LoanStatus): string {
    return this.statusLabels[status] ?? status;
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: 'success-snack' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'error-snack' });
  }
}
