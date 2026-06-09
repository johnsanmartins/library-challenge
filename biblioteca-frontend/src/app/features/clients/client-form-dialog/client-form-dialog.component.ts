import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';

/** Solo letras (incluyendo acentos/ñ), espacios, apóstrofes y guiones */
const LETTERS_ONLY = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

/** Teléfono: + opcional, solo dígitos, espacios, guiones y paréntesis, 7-20 chars */
const PHONE_PATTERN = /^[+]?[0-9\s\-(). ]{7,20}$/;

function lettersOnlyValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return LETTERS_ONLY.test(control.value) ? null : { lettersOnly: true };
}

@Component({
  selector: 'app-client-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, NgIf
  ],
  templateUrl: './client-form-dialog.component.html'
})
export class ClientFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEdit: boolean;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ClientFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client | null }
  ) {
    this.isEdit = !!data.client;
  }

  ngOnInit(): void {
    const c = this.data.client;
    this.form = this.fb.group({
      firstName: [c?.firstName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        lettersOnlyValidator
      ]],
      lastName: [c?.lastName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        lettersOnlyValidator
      ]],
      email: [c?.email ?? '', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      phone: [c?.phone ?? '', [
        Validators.pattern(PHONE_PATTERN)
      ]]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const action = this.isEdit
      ? this.clientService.update(this.data.client!.id, this.form.value)
      : this.clientService.create(this.form.value);

    action.subscribe({
      next: () => {
        this.snackBar.open(`Cliente ${this.isEdit ? 'actualizado' : 'creado'}`, 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Ocurrió un error', 'Cerrar',
          { duration: 5000, panelClass: 'error-snack' });
        this.saving = false;
      }
    });
  }

  /** Permite solo letras, espacios, apóstrofes y guiones al escribir */
  allowLetters(event: KeyboardEvent): boolean {
    if (event.key.length > 1) return true; // teclas de control (Enter, Backspace, etc.)
    return /[a-zA-ZÀ-ÿ\s'\-]/.test(event.key);
  }

  /** Permite solo los caracteres válidos de un teléfono al escribir */
  allowPhoneChars(event: KeyboardEvent): boolean {
    if (event.key.length > 1) return true;
    return /[0-9+\s\-(). ]/.test(event.key);
  }

  cancel(): void { this.dialogRef.close(false); }
}
