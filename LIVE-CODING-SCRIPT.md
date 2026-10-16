# 🎤 Live-Coding Script — "Type-Safe and Signal-Driven"

GDG Soweto · Faith Kawira · Angular 22 (Signal Forms are stable since v22)

**Golden rule:** every step has a finished copy in `src/app/demos/`. If something breaks, say *"this is why we have checkpoints"*, click the matching tab, and keep going.

---

## ✅ Before you go on stage (night before + 10 min before)

- [ ] `npm install` then `npm start` — app opens on http://localhost:4200, **Live** tab is empty.
- [ ] VS Code: font size **20+** (`Ctrl/Cmd +`), theme with high contrast, Zen mode (`Ctrl/Cmd K Z`).
- [ ] Close Slack, email, notifications. Turn off any AI autocomplete so the audience sees *you* type.
- [ ] Split screen: VS Code left (60%), browser right (40%). Browser zoom 125%.
- [ ] Open these tabs in VS Code, in order: `live/live-coding.ts`, `demos/01-reactive-before.ts`, `shared/fake-api.ts`.
- [ ] Run once through all demo tabs to warm the dev server.
- [ ] Wi-Fi off is fine — `fake-api.ts` works offline.

Timing for coding blocks: **Live 1 ≈ 7 min · Live 2 ≈ 6 min · Live 3 ≈ 6 min · Interop ≈ 2 min**

---

## LIVE 1 — From signal to form (≈ 7 min)

> 🗣️ *"Let's build the actual registration form for GDG Soweto. Shout out: what fields do we need?"*
> (Take 2–3 answers. Steer to name, email, password.)

**Step 1 — the model is just a type + a signal.** Above `@Component`:

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

**Step 2 — wrap it in a form.** Add `form, FormField` to imports:

```ts
import { form, FormField } from '@angular/forms/signals';
// ...
imports: [FormField, JsonPipe],   // also import JsonPipe from '@angular/common'
// ...
regForm = form(this.attendee);
```

**Step 3 — bind inputs.** In the template, inside `<form>`:

```html
<label>Name <input [formField]="regForm.name" /></label>
<label>Email <input type="email" [formField]="regForm.email" /></label>
<label>Password <input type="password" [formField]="regForm.password" /></label>

<pre>{{ attendee() | json }}</pre>
```

Save. Type in the browser → JSON updates live.

> 🗣️ *"No FormGroup. No FormControl. No formControlName strings. The form IS my data."*

**Step 4 — 🎯 the type-safety moment.** Change `regForm.email` → `regForm.emial`. Save. Show the red squiggle / terminal:

`Property 'emial' does not exist ... Did you mean 'email'?`

> 🗣️ *"Hands up if you've ever shipped a typo in `formControlName`. ✋ The compiler now catches it."*
> Fix it back.

**Step 5 — add rules with a schema.** Extend imports with `required, email, minLength`:

```ts
regForm = form(this.attendee, (path) => {
  required(path.name, { message: 'Name is required' });
  required(path.email, { message: 'Email is required' });
  email(path.email, { message: 'Enter a valid email' });
  minLength(path.password, 8, { message: 'At least 8 characters' });
});
```

**Step 6 — show errors.** Under the email input:

```html
@if (regForm.email().touched() && regForm.email().invalid()) {
  @for (err of regForm.email().errors(); track err.kind) {
    <span class="error">{{ err.message }}</span>
  }
}
```

And a button: `<button [disabled]="regForm().invalid()">Register</button>`

> 🗣️ Point out: `regForm.email` (no parens) = the **field**, `regForm.email()` (with parens) = its **state**. Every piece of state is a signal: `value()`, `valid()`, `touched()`, `errors()`.

**Step 7 (if time) — derived state with `computed`:**

```ts
strength = computed(() => {
  const pw = this.regForm.password().value();
  if (!pw) return '—';
  if (pw.length < 8) return 'weak 🔴';
  return /[0-9]/.test(pw) && /[A-Z]/.test(pw) ? 'strong 🟢' : 'okay 🟡';
});
```

`<span class="hint">Strength: {{ strength() }}</span>`

> 🗣️ *"Compare this to the `valueChanges.pipe(...)` in the Before tab. Same result, zero subscriptions."*

🛟 Checkpoint: **2 · Basics** tab / `demos/02-signal-basics.ts`

---

## LIVE 2 — Dynamic & cross-field validation (≈ 6 min)

> 🗣️ *"Students and professionals register differently. Who here is a student? Professional?"* (hands)

Open `demos/03-dynamic-validation.ts` — the model + template are ready. **Delete the body of the schema function** before the talk (keep a copy!) and type these live:

```ts
// 1. Show/hide based on another field
hidden(p.university, ({ valueOf }) => valueOf(p.ticket) !== 'student');
hidden(p.company, ({ valueOf }) => valueOf(p.ticket) !== 'professional');
hidden(p.yearsExperience, ({ valueOf }) => valueOf(p.ticket) !== 'professional');

// 2. Conditional rule
required(p.university, {
  when: ({ valueOf }) => valueOf(p.ticket) === 'student',
  message: 'Students: tell us your university',
});

// 3. A whole block of rules switched on together
applyWhen(p, ({ value }) => value().ticket === 'professional', (pro) => {
  required(pro.company, { message: 'Company is required for professionals' });
  min(pro.yearsExperience, 1, { message: 'Professionals need at least 1 year' });
});
```

Flip the dropdown back and forth.

> 🗣️ *"No `setValidators()`, no `updateValueAndValidity()`, no subscribing to the dropdown. The rule just reads another signal."*

```ts
// 4. Cross-field — passwords match
validate(p.confirmPassword, ({ value, valueOf }) =>
  value() === valueOf(p.password)
    ? undefined
    : { kind: 'mismatch', message: "Passwords don't match" },
);

// 5. Disabled — with a reason!
disabled(p.tshirtSize, ({ valueOf }) => (valueOf(p.wantsTshirt) ? false : 'Tick the T-shirt box first'));
required(p.tshirtSize, { when: ({ valueOf }) => valueOf(p.wantsTshirt), message: 'Pick a size' });
```

> 🗣️ Inspect the `<select>` in DevTools: Angular adds `required` and `disabled` attributes for you (good for accessibility).

🛟 Checkpoint: **3 · Dynamic** tab

---

## LIVE 3 — Async validation + submit, no RxJS (≈ 6 min)

> 🗣️ *"Audience challenge: give me a username you think is taken."* Type their suggestions. Taken list: `faith, admin, gdg, soweto, angular`. Show `shared/fake-api.ts` briefly.

Open `demos/04-async-and-submit.ts`. Delete `debounce(...)` and `validateAsync(...)` before the talk and type:

```ts
debounce(p.username, 300);

validateAsync(p.username, {
  params: ({ value }) => (value().length >= 3 ? value() : undefined), // undefined = skip
  factory: (username) =>
    resource({
      params: username,
      loader: ({ params }) => isUsernameAvailable(params),
    }),
  onSuccess: (available) =>
    available ? undefined : { kind: 'taken', message: 'Username already taken 😬' },
  onError: () => ({ kind: 'network', message: 'Could not check username' }),
});
```

Type `gdg` → ⏳ *Checking…* → ❌ taken. Type `thabo` → ✓.

> 🗣️ *"Pending state, cancelling stale requests, debounce — that used to be `switchMap`, `debounceTime`, `catchError`, `finalize`… Now it's config."*
> 💡 With a real API, swap for `validateHttp(p.username, { request: ({value}) => \`/api/check?u=${value()}\`, onSuccess, onError })`.

**Submit.** Point at the `submission.action` option and `<form [formRoot]="signup">`. Enter email `taken@gdg.dev` → server error appears **on the email field**. Change email → 🎉.

> 🗣️ *"Server errors are just validation errors. Return them from `action` and they land on the right field."*

🛟 Checkpoint: **4 · Async + Submit** tab

---

## INTEROP — "But my app has 200 reactive forms…" (≈ 2 min, no typing)

Click **5 · Interop**. Show `SignalFormControl` living inside an old `FormGroup`. Fill both → status flips to `VALID`.

> 🗣️ *"Migrate one field at a time. `SignalFormControl` for bottom-up, `compatForm` for top-down."*

---

## 🧯 If things go wrong

| Problem | Fix |
|---|---|
| Red compile error you can't find | Click the checkpoint tab, keep talking |
| Dev server crashed | `Ctrl+C`, `npm start` (talk about the next slide while it boots) |
| Brain freeze | Glance at this file on your phone / second screen |
| Running late | Skip Live 2 typing — show the finished tab and talk through it |
