# Presenter Script: "Type-Safe and Signal-Driven"

GDG Soweto · Faith Kawira · Angular 22

| Demo | Tab | What you do | Time |
|---|---|---|---|
| 1 | 1 · Before | Show the old way | 2 min |
| 2 | Live (backup: 2 · Basics) | Type it | 7 min |
| 3 | 3 · Dynamic | Type it | 6 min |
| 4 | 4 · Async + Submit | Type it | 6 min |
| 5 | 5 · Interop | Show it | 2 min |

The step numbers below match the `// Step` comments in each demo file.
Lines in quotes are what you say to the audience.

---

## Before the talk

1. Run `npm install`, then `npm start`. Open http://localhost:4200.
2. In VS Code, set the font size to 20+ and turn off AI autocomplete.
3. Turn off notifications (Slack, email).
4. Put VS Code on the left (60%) and the browser on the right (40%, zoom 125%).
5. In `demos/03-dynamic-validation.ts`, delete everything inside `form(this.model, (p) => { ... })`.
6. In `demos/04-async-and-submit.ts`, delete the `debounce(...)` and `validateAsync(...)` lines.
7. Click through every tab once.

Wi-Fi is not needed. The fake server in `shared/fake-api.ts` runs offline.

---

## Demo 1: Before (2 min, no typing)

**Tab:** 1 · Before · **File:** `demos/01-reactive-before.ts`

1. Show the form working in the browser.
2. Scroll through the file and point at the three `Problem` comments:
   - **Problem 1:** fields are found by string, so typos are not caught.
   - **Problem 2:** comparing two fields needs a validator on the whole group.
   - **Problem 3:** showing one number needs RxJS and cleanup.

> "This works. But let's see how much simpler it gets with Signal Forms."

---

## Demo 2: Basics (7 min, live)

**Type in:** `live/live-coding.ts` · **If stuck:** click the **2 · Basics** tab

> "Let's build the GDG Soweto registration form. What fields do we need?"
> (Take 2 or 3 answers. Steer towards name, email, password.)

### Step 1: Create the model

Above `@Component`:

```ts
interface Attendee {
  name: string;
  email: string;
  password: string;
}
```

Inside the class:

```ts
attendee = signal<Attendee>({ name: '', email: '', password: '' });
```

> "The model is just a type and a signal."

### Step 2: Create the form and bind the inputs

Imports:

```ts
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
// in @Component:
imports: [FormField, JsonPipe],
```

Inside the class:

```ts
regForm = form(this.attendee);
```

In the template, inside `<form>`:

```html
<label>Name <input [formField]="regForm.name" /></label>
<label>Email <input type="email" [formField]="regForm.email" /></label>
<label>Password <input type="password" [formField]="regForm.password" /></label>

<pre>{{ attendee() | json }}</pre>
```

Save and type in the browser. The JSON updates live.

> "No FormGroup. No FormControl. No string names. The form is my data."

Now show type safety: change `regForm.email` to `regForm.emial` and save. The build fails:
`Property 'emial' does not exist ... Did you mean 'email'?`

> "Who has ever shipped a typo in formControlName? The compiler now catches it."

Fix the typo.

### Step 3: Add rules and show errors

Add `required, email, minLength` to the import, then:

```ts
regForm = form(this.attendee, (path) => {
  required(path.name, { message: 'Name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Enter a valid email' });
  minLength(path.password, 8, { message: 'At least 8 characters' });
});
```

Under the email input:

```html
@if (regForm.email().touched() && regForm.email().invalid()) {
  @for (err of regForm.email().errors(); track err.kind) {
    <span class="error">{{ err.message }}</span>
  }
}
```

At the end of the form:

```html
<button [disabled]="regForm().invalid()">Register</button>
```

> "`regForm.email` is the field. `regForm.email()` is its state: value, valid, touched, errors. Every one is a signal."

### Step 4: Add a computed value (if there's time)

Add `computed` to the `@angular/core` import, then:

```ts
strength = computed(() => {
  const pw = this.regForm.password().value();
  if (!pw) return '-';
  if (pw.length < 8) return 'weak';
  return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong' : 'okay';
});
```

```html
<span class="hint">Strength: {{ strength() }}</span>
```

> "Compare this with the RxJS pipeline in Demo 1. Same result, no subscriptions."

---

## Demo 3: Dynamic (6 min, live)

**Type in:** `demos/03-dynamic-validation.ts`, inside `form(this.model, (p) => { ... })`
**If stuck:** run `git checkout src/app/demos/03-dynamic-validation.ts` to restore the finished file.

> "Students and professionals register differently. Who here is a student? A professional?"

### Step 1: Hide fields based on the ticket type

```ts
hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
```

Save and switch the ticket type in the browser.

> "No subscribing to the dropdown. The rule just reads another field."

### Step 2: Make one rule conditional

```ts
required(p.university, {
  when: ({ valueOf }) => valueOf(p.ticket) === 'student',
  message: 'Students: tell us your university',
});
```

### Step 3: Turn a group of rules on together

```ts
applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
  required(pro.company, { message: 'Company is required for professionals' });
  min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
});
```

> "No setValidators(), no updateValueAndValidity()."

### Step 4: Compare two fields

```ts
validate(p.confirmPassword, ({ value, valueOf }) =>
  value() === valueOf(p.password)
    ? undefined
    : { kind: 'mismatch', message: "Passwords don't match" },
);
```

> "In Demo 1 this needed a validator on the whole group. Here it's one rule on one field."

### Step 5: Disable a field, with a reason

```ts
disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
```

Save. The T-shirt size shows the reason it's disabled. Tick the box to enable it.

---

## Demo 4: Async + Submit (6 min, live)

**Type in:** `demos/04-async-and-submit.ts`, under `required(p.username, ...)`
**If stuck:** run `git checkout src/app/demos/04-async-and-submit.ts` to restore the finished file.

> "Give me a username you think is taken."

### Step 1: Wait until the user stops typing

```ts
debounce(p.username, 300);
```

### Step 2: Ask the server if the username is free

```ts
validateAsync(p.username, {
  params: ({ value }) => (value().length >= 3 ? value() : undefined),
  factory: (username) =>
    resource({
      params: username,
      loader: ({ params }) => isUsernameAvailable(params),
    }),
  onSuccess: (available) =>
    available ? undefined : { kind: 'taken', message: 'Username already taken' },
  onError: () => ({ kind: 'network', message: 'Could not check username' }),
});
```

Save. Type `gdg`: "Checking availability..." then "Username already taken". Type `thabo`: "Available".
(Taken names: `faith, admin, gdg, soweto, angular`.)

> "Loading state, cancelling old requests, debounce. That used to be switchMap, debounceTime, catchError. Now it's a few lines of config."

### Step 3: Submit the form

This part is already written. Point at `submission` in the code and `[formRoot]` in the template.

1. Enter the email `taken@gdg.dev` and submit. The server error appears under the email field.
2. Change the email and submit again. It says "You're in!".

> "Server errors are just validation errors. They show up on the right field."

---

## Demo 5: Interop (2 min, no typing)

**Tab:** 5 · Interop · **File:** `demos/05-interop.ts`

1. Show the code: a new `SignalFormControl` inside an old `FormGroup`.
2. Fill in both fields. The status changes to `VALID`.

> "You don't need to rewrite your app. Migrate one field at a time."

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Error in Demo 2 | Click the **2 · Basics** tab and keep talking |
| Error in Demo 3 or 4 | Run the `git checkout` command for that demo (shown above) |
| Dev server crashed | `Ctrl+C`, then `npm start` |
| Running late | Skip typing Demo 3. Restore the file and talk through it |
