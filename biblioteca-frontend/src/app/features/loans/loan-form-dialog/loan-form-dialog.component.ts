import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgFor, NgIf } from '@angular/common';

import { LoanService } from '../../../core/services/loan.service';
import { BookService } from '../../../core/services/book.service';
import { ClientService } from '../../../core/services/client.service';
import { Book } from '../../../core/models/book.model';
import { Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-loan-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule,
    NgFor, NgIf
  ],
  templateUrl: './loan-form-dialog.component.html'
})
export class LoanFormDialogComponent implements OnInit {
  form!: FormGroup;
  books: Book[] = [];
  clients: Client[] = [];
  saving = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private bookService: BookService,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<LoanFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loan: null }
  ) {}

  ngOnInit(): void {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);

    this.form = this.fb.group({
      bookId:   [null, Validators.required],
      clientId: [null, Validators.required],
      dueDate:  [defaultDue, Validators.required]
    });

    this.bookService.getAll({ size: 200, sortBy: 'title' })
      .subscribe(p => this.books = p.content.filter(b => b.availableCopies > 0));
    this.clientService.getAll({ size: 200, sortBy: 'lastName' })
      .subscribe(p => this.clients = p.content);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;
    const request = {
      bookId:   value.bookId,
      clientId: value.clientId,
      dueDate:  (value.dueDate as Date).toISOString().split('T')[0]
    };

    this.loanService.create(request).subscribe({
      next: () => {
        this.snackBar.open('Préstamo creado', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Ocurrió un error', 'Cerrar',
          { duration: 5000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  cancel(): void { this.dialogRef.close(false); }
}
