import {
  Component, OnInit, ViewChild, ChangeDetectionStrategy, signal
} from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BookService } from '../../../core/services/book.service';
import { Book } from '../../../core/models/book.model';
import { BookFormDialogComponent } from '../book-form-dialog/book-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatIconModule, MatInputModule, MatFormFieldModule, MatDialogModule,
    MatSnackBarModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    FormsModule, NgIf
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  displayedColumns = ['title', 'isbn', 'publishedYear', 'category', 'authors', 'availableCopies', 'actions'];

  dataSource = new MatTableDataSource<Book>([]);
  totalElements = signal(0);
  loading = signal(false);

  pageSize = 10;
  pageIndex = 0;
  sortBy = 'title';
  sortDir: 'asc' | 'desc' = 'asc';
  searchTerm = '';

  private searchSubject = new Subject<string>();

  constructor(
    private bookService: BookService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadBooks();
    });
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading.set(true);
    this.bookService.getAll({
      page: this.pageIndex,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.searchTerm || undefined
    }).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.showError('Error al cargar los libros');
        this.loading.set(false);
      }
    });
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active || 'title';
    this.sortDir = (sort.direction as 'asc' | 'desc') || 'asc';
    this.loadBooks();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(BookFormDialogComponent, {
      width: '600px',
      data: { book: null }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadBooks();
    });
  }

  openEditDialog(book: Book): void {
    const ref = this.dialog.open(BookFormDialogComponent, {
      width: '600px',
      data: { book }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadBooks();
    });
  }

  openDeleteDialog(book: Book): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: `¿Está seguro que desea eliminar "${book.title}"?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.bookService.delete(book.id).subscribe({
          next: () => {
            this.showSuccess('Libro eliminado');
            this.loadBooks();
          },
          error: () => this.showError('Error al eliminar el libro')
        });
      }
    });
  }

  getAuthorNames(book: Book): string {
    return book.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ') || '—';
  }

  private showSuccess(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: 'success-snack' });
  }

  private showError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'error-snack' });
  }
}
