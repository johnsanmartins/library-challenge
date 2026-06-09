import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NgIf, DatePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { ClientFormDialogComponent } from '../client-form-dialog/client-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, MatProgressSpinnerModule,
    FormsModule, NgIf, DatePipe
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {
  displayedColumns = ['firstName', 'lastName', 'email', 'phone', 'registrationDate', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  totalElements = signal(0);
  loading = signal(false);

  pageSize = 10;
  pageIndex = 0;
  sortBy = 'lastName';
  sortDir: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  private searchSubject = new Subject<string>();

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(() => { this.pageIndex = 0; this.loadClients(); });
  }

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAll({
      page: this.pageIndex, size: this.pageSize,
      sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => { this.showError('Error al cargar los clientes'); this.loading.set(false); }
    });
  }

  onSearch(value: string): void { this.searchSubject.next(value); }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active || 'lastName';
    this.sortDir = (sort.direction as 'asc' | 'desc') || 'asc';
    this.loadClients();
  }

  openCreateDialog(): void {
    this.dialog.open(ClientFormDialogComponent, { width: '500px', data: { client: null } })
      .afterClosed().subscribe(r => { if (r) this.loadClients(); });
  }

  openEditDialog(client: Client): void {
    this.dialog.open(ClientFormDialogComponent, { width: '500px', data: { client } })
      .afterClosed().subscribe(r => { if (r) this.loadClients(); });
  }

  openDeleteDialog(client: Client): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `¿Eliminar al cliente "${client.firstName} ${client.lastName}"?` }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.delete(client.id).subscribe({
          next: () => { this.showSuccess('Cliente eliminado'); this.loadClients(); },
          error: (err) => this.showError(err.error?.message || 'No se puede eliminar el cliente')
        });
      }
    });
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: 'success-snack' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'error-snack' });
  }
}
