// DEMO 5 — CHECKPOINT: bridging the gap. You do NOT have to rewrite your app.
// Drop a signal-powered control into an EXISTING Reactive FormGroup.
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
      <label>Talk title (signal rules!) <input [formField]="titleControl.fieldTree" /></label>
      @for (e of titleControl.fieldTree().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <label>Speaker (old FormControl) <input formControlName="speaker" /></label>

      <span class="hint">FormGroup status: <b>{{ legacyForm.status }}</b></span>
    </form>
  `,
})
export class Interop {
  titleControl = new SignalFormControl('', (p) => {
    required(p, { message: 'Every talk needs a title' });
    minLength(p, 5, { message: 'Make it at least 5 characters' });
  });

  legacyForm = new FormGroup({
    title: this.titleControl,
    speaker: new FormControl('', Validators.required),
  });
}
