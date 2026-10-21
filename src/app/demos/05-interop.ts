// Demo 5: Interop
// You don't have to rewrite your app. Add one signal-powered field
// to an existing Reactive FormGroup, and migrate one field at a time.
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, minLength, required } from '@angular/forms/signals';
import { SignalFormControl } from '@angular/forms/signals/compat';
import { demoStyles } from '../shared/styles';

@Component({
  selector: 'app-interop',
  imports: [ReactiveFormsModule, FormField],
  styles: demoStyles,
  template: `
    <h2>Interop: migrate one field at a time</h2>
    <form [formGroup]="legacyForm">
      <!-- New field: Signal Forms rules -->
      <label>Talk title (signal rules) <input [formField]="titleControl.fieldTree" /></label>
      @for (e of titleControl.fieldTree().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <!-- Old field: unchanged -->
      <label>Speaker (old FormControl) <input formControlName="speaker" /></label>

      <span class="hint">FormGroup status: <b>{{ legacyForm.status }}</b></span>
    </form>
  `,
})
export class Interop {
  // New: a control with Signal Forms rules that a FormGroup accepts.
  titleControl = new SignalFormControl('', (p) => {
    required(p, { message: 'Every talk needs a title' });
    minLength(p, 5, { message: 'Make it at least 5 characters' });
  });

  // Old: a normal FormGroup holding both controls.
  legacyForm = new FormGroup({
    title: this.titleControl,
    speaker: new FormControl('', Validators.required),
  });
}
