// DEMO 5 - interop: you do not have to rewrite your whole app to adopt Signal Forms.
// Here an existing Reactive FormGroup gets one new field powered by signal rules.
// The old and new controls live side by side in the same form, so a large app
// can migrate gradually, one field at a time.
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
      <!-- The new field is bound with [formField], like in the other signal demos. -->
      <label>Talk title (signal rules) <input [formField]="titleControl.fieldTree" /></label>
      @for (e of titleControl.fieldTree().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <!-- The existing field is untouched and still uses formControlName. -->
      <label>Speaker (old FormControl) <input formControlName="speaker" /></label>

      <!-- The FormGroup's status takes both fields into account. -->
      <span class="hint">FormGroup status: <b>{{ legacyForm.status }}</b></span>
    </form>
  `,
})
export class Interop {
  // SignalFormControl looks like a normal FormControl to the FormGroup,
  // but its validation rules are written with the Signal Forms schema API.
  titleControl = new SignalFormControl('', (p) => {
    required(p, { message: 'Every talk needs a title' });
    minLength(p, 5, { message: 'Make it at least 5 characters' });
  });

  // An ordinary Reactive FormGroup, containing one new control and one old one.
  legacyForm = new FormGroup({
    title: this.titleControl,
    speaker: new FormControl('', Validators.required),
  });
}
