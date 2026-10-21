// Demo 4: Async + Submit
// Check a value with the server, then submit the form. No RxJS needed.
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
    <!-- [formRoot] handles submit for us: no page reload, then runs our action. -->
    <form [formRoot]="signup">
      <label>Username <input [formField]="signup.username" placeholder="try: faith, gdg, soweto" /></label>
      <!-- pending() is true while the server check is running. -->
      @if (signup.username().pending()) {
        <span class="hint">Checking availability...</span>
      } @else if (signup.username().invalid()) {
        @for (e of signup.username().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
      } @else if (signup.username().value()) {
        <span class="ok">Available</span>
      }

      <label>Email <input [formField]="signup.email" placeholder="try: taken@gdg.dev" /></label>
      @for (e of signup.email().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <!-- submitting() is true while the submit action is running. -->
      <button type="submit" [disabled]="signup().submitting()">
        {{ signup().submitting() ? 'Registering...' : 'Get my ticket' }}
      </button>
      @if (done()) { <span class="ok">You're in! See you at GDG Soweto.</span> }
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

      // Step 1: wait until the user stops typing (300ms).
      debounce(p.username, 300);

      // Step 2: ask the server if the username is free.
      validateAsync(p.username, {
        params: ({ value }) => (value().length >= 3 ? value() : undefined), // what to send (undefined = skip)
        factory: (username) =>
          resource({
            params: username,
            loader: ({ params }) => isUsernameAvailable(params), // the server call
          }),
        onSuccess: (available) => (available ? undefined : { kind: 'taken', message: 'Username already taken' }),
        onError: () => ({ kind: 'network', message: 'Could not check username' }),
      });

      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email' });
    },
    {
      // Step 3: submit. A server error is returned for a field and shows under it.
      submission: {
        action: async (f) => {
          const res = await registerAttendee(f().value());
          if (!res.ok) {
            return { fieldTree: f.email, kind: 'server', message: res.message };
          }
          this.done.set(true);
          return undefined; // success
        },
      },
    },
  );
}
