// DEMO 3 — CHECKPOINT: dynamic + cross-field validation, hidden & disabled fields.
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { applyWhen, disabled, form, FormField, hidden, min, required, validate } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

type TicketType = 'student' | 'professional';

interface Registration {
  ticket: TicketType;
  university: string;   // only for students
  company: string;      // only for professionals
  yearsExperience: number;
  password: string;
  confirmPassword: string;
  wantsTshirt: boolean;
  tshirtSize: string;
}

@Component({
  selector: 'app-dynamic-validation',
  imports: [FormField, JsonPipe],
  styles: demoStyles,
  template: `
    <h2>Dynamic validation</h2>
    <form>
      <label>Ticket type
        <select [formField]="reg.ticket">
          <option value="student">Student</option>
          <option value="professional">Professional</option>
        </select>
      </label>

      <!-- hidden() doesn't remove from the DOM — you decide with @if -->
      @if (!reg.university().hidden()) {
        <label>University <input [formField]="reg.university" /></label>
        @for (e of reg.university().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
      }
      @if (!reg.company().hidden()) {
        <label>Company <input [formField]="reg.company" /></label>
        @for (e of reg.company().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
        <label>Years of experience <input type="number" [formField]="reg.yearsExperience" /></label>
        @for (e of reg.yearsExperience().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
      }

      <label>Password <input type="password" [formField]="reg.password" /></label>
      <label>Confirm password <input type="password" [formField]="reg.confirmPassword" /></label>
      @for (e of reg.confirmPassword().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <label class="row"><input type="checkbox" [formField]="reg.wantsTshirt" /> I want a GDG T-shirt</label>
      <label>T-shirt size
        <select [formField]="reg.tshirtSize">
          <option value="">Pick one</option><option>S</option><option>M</option><option>L</option><option>XL</option>
        </select>
      </label>
      @for (r of reg.tshirtSize().disabledReasons(); track $index) { <span class="hint">🔒 {{ r.message }}</span> }
      @for (e of reg.tshirtSize().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <button [disabled]="reg().invalid()">Register</button>
    </form>
    <pre>{{ model() | json }}</pre>
  `,
})
export class DynamicValidation {
  model = signal<Registration>({
    ticket: 'student',
    university: '',
    company: '',
    yearsExperience: 0,
    password: '',
    confirmPassword: '',
    wantsTshirt: false,
    tshirtSize: '',
  });

  reg = form(this.model, (p) => {
    // 🔀 Rules react to OTHER fields via valueOf(). It's all signals, so it just stays in sync.
    hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
    hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
    hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');

    // Option A: a 'when' condition on a single rule
    required(p.university, {
      when: ({ valueOf }) => valueOf(p.ticket) === 'student',
      message: 'Students: tell us your university',
    });

    // Option B: applyWhen — a whole block of rules switched on/off together
    applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
      required(pro.company, { message: 'Company is required for professionals' });
      min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
    });

    // ✅ Cross-field validation: no FormGroup-level validator, just read the other field.
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password) ? undefined : { kind: 'mismatch', message: "Passwords don't match" },
    );

    // 🚫 disabled() can return a string — the REASON it's disabled.
    disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
    required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
  });
}
