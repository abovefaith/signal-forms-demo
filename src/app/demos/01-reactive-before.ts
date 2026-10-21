// Demo 1: Before
// A registration form built the classic way, with Reactive Forms.
// It works, but it has three problems (marked below).
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { demoStyles } from '../shared/styles';

// Problem 2: a rule that compares two fields must sit on the whole group,
// and it finds the fields by string name.
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reactive-before',
  imports: [ReactiveFormsModule],
  styles: demoStyles,
  template: `
    <h2>Before: Reactive Forms</h2>
    <form [formGroup]="reactiveForm">
      <label>Name <input formControlName="name" /></label>
      @if (reactiveForm.controls.name.touched && reactiveForm.controls.name.hasError('required')) {
        <span class="error">Name is required</span>
      }

      <label>Email <input formControlName="email" /></label>
      @if (reactiveForm.controls.email.touched && reactiveForm.controls.email.hasError('email')) {
        <span class="error">Enter a valid email</span>
      }

      <label>Password <input type="password" formControlName="password" /></label>
      <label>Confirm <input type="password" formControlName="confirmPassword" /></label>
      @if (reactiveForm.hasError('mismatch')) { <span class="error">Passwords don't match</span> }

      <span class="hint">Name length (via valueChanges pipe): {{ nameLength }}</span>
      <button [disabled]="reactiveForm.invalid">Register</button>
    </form>
  `,
})
export class ReactiveBefore {
  // Problem 1: fields are looked up by string.
  // reactiveForm.get('passwrd') (a typo) still compiles, and returns null at runtime.
  reactiveForm = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(8)] }),
      confirmPassword: new FormControl('', { nonNullable: true }),
    },
    { validators: passwordsMatch },
  );

  // Problem 3: to show one number (the name length) we need a subscription,
  // an RxJS pipeline, and cleanup so we don't leak memory.
  nameLength = 0;
  constructor() {
    this.reactiveForm.controls.name.valueChanges
      .pipe(startWith(''), debounceTime(100), map((v) => v.length), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((len) => (this.nameLength = len));
  }
}
