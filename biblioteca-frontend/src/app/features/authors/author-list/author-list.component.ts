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

import { AuthorService } from '../../../core/services/author.service';
import { Author } from '../../../core/models/author.model';
import { AuthorFormDialogComponent } from '../author-form-dialog/author-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-author-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, MatProgressSpinnerModule,
    FormsModule, NgIf, DatePipe
  ],
  templateUrl: './author-list.component.html',
  styleUrl: './author-list.component.scss'
})
export class AuthorListComponent implements OnInit {
  displayedColumns = ['firstName', 'lastName', 'nationality', 'birthDate', 'actions'];
  dataSource = new MatTableDataSource<Author>([]);
  totalElements = signal(0);
  loading = signal(false);

  pageSize = 10;
  pageIndex = 0;
  sortBy = 'lastName';
  sortDir: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  private searchSubject = new Subject<string>();

  constructor(
    private authorService: AuthorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(() => { this.pageIndex = 0; this.loadAuthors(); });
  }

  ngOnInit(): void { this.loadAuthors(); }

  loadAuthors(): void {
    this.loading.set(true);
    this.authorService.getAll({
      page: this.pageIndex, size: this.pageSize,
      sortBy: this.sortBy, sortDir: this.sortDir,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => { this.showError('Error al cargar los autores'); this.loading.set(false); }
    });
  }

  onSearch(value: string): void { this.searchSubject.next(value); }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuthors();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active || 'lastName';
    this.sortDir = (sort.direction as 'asc' | 'desc') || 'asc';
    this.loadAuthors();
  }

  openCreateDialog(): void {
    this.dialog.open(AuthorFormDialogComponent, { width: '500px', data: { author: null } })
      .afterClosed().subscribe(r => { if (r) this.loadAuthors(); });
  }

  openEditDialog(author: Author): void {
    this.dialog.open(AuthorFormDialogComponent, { width: '500px', data: { author } })
      .afterClosed().subscribe(r => { if (r) this.loadAuthors(); });
  }

  openDeleteDialog(author: Author): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `¿Eliminar al autor "${author.firstName} ${author.lastName}"?` }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.authorService.delete(author.id).subscribe({
          next: () => { this.showSuccess('Autor eliminado'); this.loadAuthors(); },
          error: (err) => this.showError(err.error?.message || 'No se puede eliminar el autor')
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
