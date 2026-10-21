# Live-Coding Script: "Type-Safe and Signal-Driven"

GDG Soweto · Faith Kawira · Angular 22 (Signal Forms are stable since v22)

**Golden rule:** every step has a finished copy in `src/app/demos/`. If something breaks, say *"this is why we have checkpoints"*, click the matching tab, and keep going.

How to read this script:
- **Step N** is something you do (type, click, save).
- **Say:** is a line for the audience.
- **Checkpoint:** is the tab to switch to if you get stuck.

---

## Before you go on stage (night before + 10 min before)

1. Run `npm install`, then `npm start`. The app opens on http://localhost:4200 and the **Live** tab is empty.
2. Set up VS Code: font size **20+** (`Ctrl/Cmd +`), a high-contrast theme, Zen mode (`Ctrl/Cmd K Z`).
3. Close Slack, email and notifications. Turn off AI autocomplete so the audience sees *you* type.
4. Split the screen: VS Code on the left (60%), browser on the right (40%). Set browser zoom to 125%.
5. Open these files in VS Code, in this order: `live/live-coding.ts`, `demos/01-reactive-before.ts`, `shared/fake-api.ts`.
6. Click through every demo tab once to warm up the dev server.
7. Wi-Fi off is fine: `fake-api.ts` works offline.

Timing for the coding blocks: **Live 1 about 7 min · Live 2 about 6 min · Live 3 about 6 min · Interop about 2 min**

---

## LIVE 1: From signal to form (about 7 min)

> **Say:** *"Let's build the actual registration form for GDG Soweto. Shout out: what fields do we need?"*
> (Take 2 or 3 answers. Steer towards name, email, password.)

**Step 1: the model is just a type plus a signal.** Above `@Component`:

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

**Step 2: wrap it in a form.** Add `form, FormField` to the imports:

```ts
import { form, FormField } from '@angular/forms/signals';
// ...
imports: [FormField, JsonPipe],   // also import JsonPipe from '@angular/common'
// ...
regForm = form(this.attendee);
```

**Step 3: bind the inputs.** In the template, inside `<form>`:

```html
<label>Name <input [formField]="regForm.name" /></label>
<label>Email <input type="email" [formField]="regForm.email" /></label>
<label>Password <input type="password" [formField]="regForm.password" /></label>

<pre>{{ attendee() | json }}</pre>
```

Save. Type in the browser and the JSON updates live.

> **Say:** *"No FormGroup. No FormControl. No formControlName strings. The form IS my data."*

**Step 4: the type-safety moment.** Change `regForm.email` to `regForm.emial`. Save. Show the red squiggle or the terminal:

`Property 'emial' does not exist ... Did you mean 'email'?`

> **Say:** *"Hands up if you've ever shipped a typo in `formControlName`. The compiler now catches it."*
> Fix the typo.

**Step 5: add rules with a schema.** Add `required, email, minLength` to the imports:

```ts
regForm = form(this.attendee, (path) => {
  required(path.name, { message: 'Name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Enter a valid email' });
  minLength(path.password, 8, { message: 'At least 8 characters' });
});
```

**Step 6: show the errors.** Under the email input:

```html
@if (regForm.email().touched() && regForm.email().invalid()) {
  @for (err of regForm.email().errors(); track err.kind) {
    <span class="error">{{ err.message }}</span>
  }
}
```

Then add a button: `<button [disabled]="regForm().invalid()">Register</button>`

> **Say:** `regForm.email` (no parentheses) is the **field**, `regForm.email()` (with parentheses) is its **state**. Every piece of state is a signal: `value()`, `valid()`, `touched()`, `errors()`.

**Step 7 (if there's time): derived state with `computed`.**

```ts
strength = computed(() => {
  const pw = this.regForm.password().value();
  if (!pw) return '-';
  if (pw.length < 8) return 'weak';
  return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong' : 'okay';
});
```

`<span class="hint">Strength: {{ strength() }}</span>`

> **Say:** *"Compare this with the `valueChanges.pipe(...)` in the Before tab. Same result, zero subscriptions."*

**Checkpoint:** **2 · Basics** tab / `demos/02-signal-basics.ts`

---

## LIVE 2: Dynamic and cross-field validation (about 6 min)

> **Say:** *"Students and professionals register differently. Who here is a student? Professional?"* (hands up)

**Preparation (before the talk):** open `demos/03-dynamic-validation.ts`. The model and template are ready. Delete the body of the schema function (keep a copy!) so you can type it live.

**Step 1: show or hide fields based on another field.**

```ts
hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
```

**Step 2: make one rule conditional with `when`.**

```ts
required(p.university, {
  when: ({ valueOf }) => valueOf(p.ticket) === 'student',
  message: 'Students: tell us your university',
});
```

**Step 3: switch a whole block of rules on together with `applyWhen`.**

```ts
applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
  required(pro.company, { message: 'Company is required for professionals' });
  min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
});
```

Save, then flip the ticket dropdown back and forth in the browser.

> **Say:** *"No `setValidators()`, no `updateValueAndValidity()`, no subscribing to the dropdown. The rule just reads another signal."*

**Step 4: cross-field validation (the passwords must match).**

```ts
validate(p.confirmPassword, ({ value, valueOf }) =>
  value() === valueOf(p.password)
    ? undefined
    : { kind: 'mismatch', message: "Passwords don't match" },
);
```

**Step 5: a disabled field, with a reason.**

```ts
disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
```

Save, then inspect the T-shirt `<select>` in DevTools.

> **Say:** *"Angular adds the `required` and `disabled` attributes for us, which is good for accessibility."*

**Checkpoint:** **3 · Dynamic** tab

---

## LIVE 3: Async validation and submit, no RxJS (about 6 min)

> **Say:** *"Audience challenge: give me a username you think is taken."* Type their suggestions. The taken list is `faith, admin, gdg, soweto, angular`. Show `shared/fake-api.ts` briefly.

**Preparation (before the talk):** open `demos/04-async-and-submit.ts` and delete `debounce(...)` and `validateAsync(...)`.

**Step 1: wait for the user to stop typing.**

```ts
debounce(p.username, 300);
```

**Step 2: add the async rule.**

```ts
validateAsync(p.username, {
  params: ({ value }) => (value().length >= 3 ? value() : undefined), // undefined = skip the check
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

Save and try it. Type `gdg`: you see *Checking availability...*, then "Username already taken". Type `thabo`: you see "Available".

> **Say:** *"Pending state, cancelling stale requests, debounce: that used to be `switchMap`, `debounceTime`, `catchError`, `finalize`... Now it's config."*
>
> **Tip:** with a real API, use `validateHttp(p.username, { request: ({value}) => \`/api/check?u=${value()}\`, onSuccess, onError })` instead.

**Step 3: show the submit setup.** Point at the `submission.action` option and at `<form [formRoot]="signup">`.

**Step 4: trigger a server error.** Enter the email `taken@gdg.dev` and submit. The server error appears **on the email field**.

**Step 5: submit successfully.** Change the email and submit again. You see "You're in!".

> **Say:** *"Server errors are just validation errors. Return them from `action` and they land on the right field."*

**Checkpoint:** **4 · Async + Submit** tab

---

## INTEROP: "But my app has 200 reactive forms..." (about 2 min, no typing)

**Step 1:** click the **5 · Interop** tab.

**Step 2:** show `SignalFormControl` living inside an old `FormGroup`.

**Step 3:** fill in both fields. The status changes to `VALID`.

> **Say:** *"Migrate one field at a time. `SignalFormControl` for bottom-up, `compatForm` for top-down."*

---

## If things go wrong

| Problem | Fix |
|---|---|
| Red compile error you can't find | Click the checkpoint tab, keep talking |
| Dev server crashed | `Ctrl+C`, then `npm start` (talk about the next slide while it boots) |
| Brain freeze | Glance at this file on your phone or a second screen |
| Running late | Skip the Live 2 typing: show the finished tab and talk through it |
