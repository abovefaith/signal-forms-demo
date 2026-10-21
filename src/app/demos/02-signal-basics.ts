// DEMO 2 - the same registration form, rebuilt with Signal Forms.
// This is the finished version of what we live-code in live/live-coding.ts.
// If anything breaks on stage, switch to this tab and carry on from here.
//
// The big idea: with Signal Forms, your data model comes first. You keep your data
// in a normal signal, and form() builds a form around it. The form reads from and
// writes to that signal, so there is only ever one copy of the data.
import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

// Step 1: describe the data with a plain TypeScript interface.
// The form's shape, and its type checking, will be inferred from this.
interface Attendee {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-signal-basics',
  imports: [FormField, JsonPipe],
  styles: demoStyles,
  template: `
    <h2>After: Signal Forms</h2>
    <form>
      <!--
        [formField] binds an input to a field. It is two-way: typing updates the model
        signal, and changing the model updates the input.
        regForm.name   (no parentheses) is the field itself.
        regForm.name() (with parentheses) is its current state: value, touched, errors...
      -->
      <label>Name <input [formField]="regForm.name" /></label>
      @if (regForm.name().touched() && regForm.name().invalid()) {
        <!-- errors() returns a list, each with the message we set in the schema below. -->
        @for (err of regForm.name().errors(); track err.kind) {
          <span class="error">{{ err.message }}</span>
        }
      }

      <label>Email <input type="email" [formField]="regForm.email" /></label>
      @if (regForm.email().touched() && regForm.email().invalid()) {
        @for (err of regForm.email().errors(); track err.kind) {
          <span class="error">{{ err.message }}</span>
        }
      }

      <label>Password <input type="password" [formField]="regForm.password" /></label>
      <span class="hint">Strength: {{ strength() }}</span>

      <!--
        Type-safety demo: rename regForm.email to regForm.emial above and save.
        The build fails immediately, instead of failing silently at runtime.
      -->
      <button [disabled]="regForm().invalid()">Register</button>
    </form>

    <!-- The raw model signal. Watch it update as you type: the form IS the data. -->
    <h3>Live model</h3>
    <pre>{{ attendee() | json }}</pre>
  `,
})
export class SignalBasics {
  // Step 2: hold the data in a regular signal with starting values.
  attendee = signal<Attendee>({ name: '', email: '', password: '' });

  // Step 3: form() turns the signal into a "field tree": one field per property,
  // fully typed. The second argument is the schema, where we declare the rules.
  // "path" points at each property, so path.name means "the name field".
  regForm = form(this.attendee, (path) => {
    required(path.name, { message: 'Name is required' });
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    minLength(path.password, 8, { message: 'At least 8 characters' });
  });

  // Step 4: values derived from the form are just computed() signals.
  // Compare with Demo 1: no valueChanges, no subscribe, no manual cleanup.
  // Angular re-runs this automatically whenever the password value changes.
  strength = computed(() => {
    const pw = this.regForm.password().value();
    if (pw.length === 0) return '-';
    if (pw.length < 8) return 'weak';
    return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong' : 'okay';
  });
}
