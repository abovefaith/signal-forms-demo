// DEMO 3 - rules that change based on what the user has entered.
// Covers: conditional (dynamic) validation, cross-field validation, and
// fields that are hidden or disabled depending on other fields.
//
// Key point: every rule can read the value of any other field. Because those
// values are signals, Angular re-evaluates the rule whenever they change.
// No subscriptions, no setValidators(), no updateValueAndValidity().
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { applyWhen, disabled, form, FormField, hidden, min, required, validate } from '@angular/forms/signals';
import { demoStyles } from '../shared/styles';

type TicketType = 'student' | 'professional';

interface Registration {
  ticket: TicketType;
  university: string;   // only asked of students
  company: string;      // only asked of professionals
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

      <!--
        hidden() only marks a field as hidden in the form state; it does not touch
        the DOM. We decide how to hide it ourselves, here with @if.
        A hidden field is also skipped during validation.
      -->
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
      <!-- The mismatch error now sits on the confirm field itself, not on a parent group. -->
      @for (e of reg.confirmPassword().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <label class="row"><input type="checkbox" [formField]="reg.wantsTshirt" /> I want a GDG T-shirt</label>
      <label>T-shirt size
        <select [formField]="reg.tshirtSize">
          <option value="">Pick one</option><option>S</option><option>M</option><option>L</option><option>XL</option>
        </select>
      </label>
      <!-- disabledReasons() lists why the field is disabled, so we can tell the user. -->
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
    // Step 1: show or hide fields based on the ticket type.
    // valueOf(p.ticket) reads the current value of another field. Because it is a
    // signal read, these rules re-run automatically when the ticket type changes.
    hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
    hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
    hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');

    // Steps 2 and 3 show two ways to make a rule conditional.

    // Step 2: add a "when" condition to a single rule.
    // University is only required if the user picked a student ticket.
    required(p.university, {
      when: ({ valueOf }) => valueOf(p.ticket) === 'student',
      message: 'Students: tell us your university',
    });

    // Step 3: applyWhen() switches a whole group of rules on or off together.
    // Useful when several fields share the same condition.
    applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
      required(pro.company, { message: 'Company is required for professionals' });
      min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
    });

    // Step 4: cross-field validation with validate(): a custom rule on confirmPassword
    // that reads the password field. Return undefined when valid, or an error
    // object (kind + message) when not. Compare with the FormGroup validator in Demo 1.
    validate(p.confirmPassword, ({ value, valueOf }) =>
      value() === valueOf(p.password) ? undefined : { kind: 'mismatch', message: "Passwords don't match" },
    );

    // Step 5: disabled() can return a string instead of true. That string becomes the
    // reason shown to the user (see disabledReasons() in the template).
    disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
    required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
  });
}
