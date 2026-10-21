// Demo 2: Basics
// The same form, built with Signal Forms.
// Your data lives in a signal, and form() builds the form around it.
import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

// Step 1: describe the data.
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
      <!-- Step 3: bind each input to a field with [formField]. -->
      <label>Name <input [formField]="regForm.name" /></label>
      <!-- Step 4: show errors. regForm.name is the field, regForm.name() is its state. -->
      @if (regForm.name().touched() && regForm.name().invalid()) {
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

      <button [disabled]="regForm().invalid()">Register</button>
    </form>

    <!-- The model updates as you type. The form IS the data. -->
    <h3>Live model</h3>
    <pre>{{ attendee() | json }}</pre>
  `,
})
export class SignalBasics {
  // Step 1: store the data in a signal.
  attendee = signal<Attendee>({ name: '', email: '', password: '' });

  // Step 2: create the form from the signal. Every field is typed.
  // Step 4: add the rules (the second argument is the "schema").
  regForm = form(this.attendee, (path) => {
    required(path.name, { message: 'Name is required' });
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    minLength(path.password, 8, { message: 'At least 8 characters' });
  });

  // Step 5: derive values with computed(). No subscribe, no cleanup.
  strength = computed(() => {
    const pw = this.regForm.password().value();
    if (!pw) return '-';
    if (pw.length < 8) return 'weak';
    return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong' : 'okay';
  });
}
