// Demo 3: Dynamic
// Rules that change based on other fields.
// A rule can read any field with valueOf(), and re-runs when that field changes.
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { applyWhen, disabled, form, FormField, hidden, min, required, validate } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

type TicketType = 'student' | 'professional';

interface Registration {
  ticket: TicketType;
  university: string;   // students only
  company: string;      // professionals only
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

      <!-- hidden() only sets a flag. We use @if to actually hide the field. -->
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
      <!-- disabledReasons() tells the user why the field is disabled. -->
      @for (r of reg.tshirtSize().disabledReasons(); track $index) { <span class="hint">{{ r.message }}</span> }
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
    // Step 1: hide fields based on the ticket type.
    hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
    hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
    hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');

    // Step 2: make one rule conditional with "when".
    required(p.university, {
      when: ({ valueOf }) => valueOf(p.ticket) === 'student',
      message: 'Students: tell us your university',
    });

    // Step 3: turn a group of rules on or off together with applyWhen().
    applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
      required(pro.company, { message: 'Company is required for professionals' });
      min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
    });

    // Step 4: compare two fields. Return undefined if valid, or an error.
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password) ? undefined : { kind: 'mismatch', message: "Passwords don't match" },
    );

    // Step 5: disable a field. The returned text is the reason shown to the user.
    disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
    required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
  });
}
