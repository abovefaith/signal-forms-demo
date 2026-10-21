// DEMO 4 - async validation (checking with a server) and form submission.
// With Reactive Forms this usually means switchMap, debounceTime, catchError and
// manual loading flags. Here it is all declared in the schema, with no RxJS.
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
    <!--
      [formRoot] connects the <form> element to our signal form. On submit it:
        - stops the browser from reloading the page,
        - turns off the browser's built-in validation popups (novalidate),
        - runs the submission action we defined in the component.
    -->
    <form [formRoot]="signup">
      <label>Username <input [formField]="signup.username" placeholder="try: faith, gdg, soweto" /></label>
      <!-- pending() is true while the async check is running, so we can show a loading message. -->
      @if (signup.username().pending()) {
        <span class="hint">Checking availability...</span>
      } @else if (signup.username().invalid()) {
        @for (e of signup.username().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }
      } @else if (signup.username().value()) {
        <span class="ok">Available</span>
      }

      <label>Email <input [formField]="signup.email" placeholder="try: taken@gdg.dev" /></label>
      @for (e of signup.email().errors(); track e.kind) { <span class="error">{{ e.message }}</span> }

      <!-- submitting() is true while the submission action is running. -->
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
      // Step 1: wait 300ms after the user stops typing before updating the model,
      // so we don't call the server on every keystroke.
      debounce(p.username, 300);

      // Step 2: an async rule that checks with the "server" whether the username is free.
      // Angular tracks the pending state and cancels outdated requests for us.
      validateAsync(p.username, {
        // params: what to send to the server. Returning undefined skips the
        // check, here for usernames shorter than 3 characters.
        params: ({ value }) => (value().length >= 3 ? value() : undefined),
        // factory: how to load the result. A resource() re-runs whenever params change.
        factory: (username) =>
          resource({
            params: username,
            loader: ({ params }) => isUsernameAvailable(params),
          }),
        // onSuccess: turn the server response into "valid" (undefined) or an error.
        onSuccess: (available) => (available ? undefined : { kind: 'taken', message: 'Username already taken' }),
        // onError: what to show if the request itself fails.
        onError: () => ({ kind: 'network', message: 'Could not check username' }),
      });

      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email' });
    },
    {
      // Step 3: submission is configured together with the form.
      // If the server rejects the data, we return an error that points at a
      // specific field (fieldTree: f.email). It then shows up under that input
      // exactly like any other validation error.
      submission: {
        action: async (f) => {
          const res = await registerAttendee(f().value());
          if (!res.ok) {
            return { fieldTree: f.email, kind: 'server', message: res.message };
          }
          this.done.set(true);
          return undefined; // undefined means the submission succeeded
        },
      },
    },
  );
}
