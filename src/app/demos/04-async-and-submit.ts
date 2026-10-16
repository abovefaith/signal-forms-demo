// DEMO 4 — CHECKPOINT: async validation + submission — zero RxJS.
import { Component, resource, signal } from '@angular/core';
import { debounce, email, form, FormField, FormRoot, required, validateAsync } from '@angular/forms/signals';
import { isUsernameAvailable, registerAttendee } from '../shared/fake-api';
import { demoStyles } from '../shared/styles';

interface SignUp {
  username: string;
  email: string;
}

@Component({
  selector: 'app-async-submit',
  imports: [FormField, FormRoot],
  styles: demoStyles,
  template: `
    <h2>Async validation &amp; submit</h2>
    <!-- formRoot: adds novalidate, prevents page reload, calls submit() for us -->
    <form [formRoot]="signup">
      <label>Username <input [formField]="signup.username" placeholder="try: faith, gdg, soweto" /></label>
      @if (signup.username().pending()) {
        <span class="hint">⏳ Checking availability…</span>
      } @else if (signup.username().invalid()) {
        @for (e of signup.username().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
      } @else if (signup.username().value()) {
        <span class="ok">✓ Available</span>
      }

      <label>Email <input [formField]="signup.email" placeholder="try: taken@gdg.dev" /></label>
      @for (e of signup.email().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <button type="submit" [disabled]="signup().submitting()">
        {{ signup().submitting() ? 'Registering…' : 'Get my ticket' }}
      </button>
      @if (done()) { <span class="ok">🎉 You're in! See you at GDG Soweto.</span> }
    </form>
  `,
})
export class AsyncSubmit {
  done = signal(false);
  model = signal<SignUp>({ username: '', email: '' });

  signup = form(
    this.model,
    (p) => {
      required(p.username, { message: 'Pick a username' });
      debounce(p.username, 300); // wait for the user to stop typing

      // ⏳ Async rule: Angular manages loading/pending/cancel for you via a resource.
      validateAsync(p.username, {
        params: ({ value }) => (value().length >= 3 ? value() : undefined), // undefined = skip
        factory: (username) =>
          resource({
            params: username,
            loader: ({ params }) => isUsernameAvailable(params),
          }),
        onSuccess: (available) => (available ? undefined : { kind: 'taken', message: 'Username already taken 😬' }),
        onError: () => ({ kind: 'network', message: 'Could not check username' }),
      });

      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email' });
    },
    {
      // 📨 Submission lives WITH the form. Server errors map straight onto fields.
      submission: {
        action: async (f) => {
          const res = await registerAttendee(f().value());
          if (!res.ok) {
            return { fieldTree: f.email, kind: 'server', message: res.message };
          }
          this.done.set(true);
          return undefined;
        },
      },
    },
  );
}
