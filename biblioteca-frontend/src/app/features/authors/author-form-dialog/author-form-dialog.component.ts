import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

import { AuthorService } from '../../../core/services/author.service';
import { Author } from '../../../core/models/author.model';

const LETTERS_ONLY = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

function lettersOnlyValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return LETTERS_ONLY.test(control.value) ? null : { lettersOnly: true };
}

@Component({
  selector: 'app-author-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule,
    MatNativeDateModule, MatSnackBarModule, NgIf
  ],
  templateUrl: './author-form-dialog.component.html'
})
export class AuthorFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit: boolean;
  saving = false;
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private authorService: AuthorService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AuthorFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { author: Author | null }
  ) {
    this.isEdit = !!data.author;
  }

  ngOnInit(): void {
    const a = this.data.author;
    this.form = this.fb.group({
      firstName: [a?.firstName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        lettersOnlyValidator
      ]],
      lastName: [a?.lastName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        lettersOnlyValidator
      ]],
      nationality: [a?.nationality ?? '', Validators.maxLength(100)],
      birthDate:   [a?.birthDate ? new Date(a.birthDate) : null]
    });
  }

  /** Permite solo letras, espacios, apóstrofes y guiones al escribir */
  allowLetters(event: KeyboardEvent): boolean {
    if (event.key.length > 1) return true;
    return /[a-zA-ZÀ-ÿ\s'\-]/.test(event.key);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.value;
    const request = {
      ...value,
      birthDate: value.birthDate
        ? (value.birthDate as Date).toISOString().split('T')[0]
        : null
    };

    const action = this.isEdit
      ? this.authorService.update(this.data.author!.id, request)
      : this.authorService.create(request);

    action.subscribe({
      next: () => {
        this.snackBar.open(`Autor ${this.isEdit ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 3000 });
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
