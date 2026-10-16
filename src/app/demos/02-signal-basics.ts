// DEMO 2 — CHECKPOINT: the same form rebuilt with Signal Forms.
// Live-code this in live/live-coding.ts. If anything breaks on stage, switch to this file.
import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

// 1️⃣ The MODEL is just a TypeScript type + a signal. This is your single source of truth.
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
      <label>Name <input [formField]="regForm.name" /></label>
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

      <!-- 🧪 Try it on stage: change regForm.email to regForm.emial → compile error! -->
      <button [disabled]="regForm().invalid()">Register</button>
    </form>

    <h3>Live model</h3>
    <pre>{{ attendee() | json }}</pre>
  `,
})
export class SignalBasics {
  // 2️⃣ Plain signal holding plain data.
  attendee = signal<Attendee>({ name: '', email: '', password: '' });

  // 3️⃣ form() wraps the signal in a FieldTree. The schema function declares the rules.
  regForm = form(this.attendee, (path) => {
    required(path.name, { message: 'Name is required' });
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email' });
    minLength(path.password, 8, { message: 'At least 8 characters' });
  });

  // 4️⃣ Derived state is just computed(). No valueChanges, no subscribe, no cleanup.
  strength = computed(() => {
    const pw = this.regForm.password().value();
    if (pw.length === 0) return '—';
    if (pw.length < 8) return 'weak 🔴';
    return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong 🟢' : 'okay 🟡';
  });
}
