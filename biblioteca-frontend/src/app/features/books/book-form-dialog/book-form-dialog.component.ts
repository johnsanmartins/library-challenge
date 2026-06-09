import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgFor, NgIf } from '@angular/common';

import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthorService } from '../../../core/services/author.service';
import { Book } from '../../../core/models/book.model';
import { Category } from '../../../core/models/category.model';
import { Author } from '../../../core/models/author.model';

@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, NgFor, NgIf
  ],
  templateUrl: './book-form-dialog.component.html'
})
export class BookFormDialogComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  authors: Author[] = [];
  isEdit: boolean;
  saving = false;
  loadingOptions = true;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BookFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book | null }
  ) {
    this.isEdit = !!data.book;
  }

  ngOnInit(): void {
    this.buildForm();
    this.loadSelectOptions();
  }

  private buildForm(): void {
    const book = this.data.book;
    this.form = this.fb.group({
      title: [book?.title ?? '', [
        Validators.required,
        Validators.maxLength(255)
      ]],
      isbn: [book?.isbn ?? '', [
        Validators.maxLength(17)
      ]],
      // Stored as string in form, parsed to number on save
      publishedYear: [
        book?.publishedYear != null ? String(book.publishedYear) : '',
        [Validators.pattern(/^\d{4}$/), Validators.min(1000), Validators.max(9999)]
      ],
      synopsis: [book?.synopsis ?? '', Validators.maxLength(1000)],
      // Stored as string in form, parsed to number on save
      availableCopies: [
        book?.availableCopies != null ? String(book.availableCopies) : '1',
        [Validators.required, Validators.pattern(/^\d{1,3}$/)]
      ],
      categoryId: [book?.category?.id ?? null],
      authorIds: [book?.authors?.map(a => a.id) ?? []]
    });
  }

  private loadSelectOptions(): void {
    this.loadingOptions = true;
    let categoriesDone = false;
    let authorsDone = false;

    const checkDone = () => {
      if (categoriesDone && authorsDone) this.loadingOptions = false;
    };

    this.categoryService.getAll().subscribe({
      next: p => { this.categories = p.content; categoriesDone = true; checkDone(); },
      error: () => { categoriesDone = true; checkDone(); }
    });

    this.authorService.getAll({ size: 200, sortBy: 'lastName' }).subscribe({
      next: p => { this.authors = p.content; authorsDone = true; checkDone(); },
      error: () => { authorsDone = true; checkDone(); }
    });
  }

  /** Solo permite dígitos en el teclado */
  allowDigits(event: KeyboardEvent): boolean {
    if (event.key.length > 1) return true; // teclas de control
    return /\d/.test(event.key);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const raw = this.form.value;

    const request = {
      ...raw,
      publishedYear: raw.publishedYear ? parseInt(raw.publishedYear, 10) : null,
      availableCopies: raw.availableCopies ? parseInt(raw.availableCopies, 10) : 0
    };

    const action = this.isEdit
      ? this.bookService.update(this.data.book!.id, request)
      : this.bookService.create(request);

    action.subscribe({
      next: () => {
        this.snackBar.open(`Libro ${this.isEdit ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        const msg = err.error?.message || 'Ocurrió un error';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
