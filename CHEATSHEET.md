# Signal Forms Cheat Sheet

`import { ... } from '@angular/forms/signals';` · Angular 22+

## 1. Model → Form → Template
```ts
user = signal({ name: '', email: '' });          // your data (source of truth)
userForm = form(this.user, (p) => {               // p = typed paths to each field
  required(p.name);
  email(p.email, { message: 'Bad email' });
});
```
```html
<input [formField]="userForm.name" />             <!-- imports: [FormField] -->
```

## 2. Field vs state
| Write | Means |
|---|---|
| `userForm.name` | the **field** (bind it) |
| `userForm.name()` | its **state** (read it) |
| `userForm()` | state of the whole form |

State signals: `value()` `valid()` `invalid()` `errors()` `touched()` `dirty()` `pending()` `disabled()` `hidden()` `submitting()`

## 3. Rules
| Need | Rule |
|---|---|
| Built-ins | `required` `email` `min` `max` `minLength` `maxLength` `pattern` `minDate` `maxDate` |
| Custom | `validate(p.x, ({ value }) => ok ? undefined : { kind: 'x', message: '…' })` |
| Other field | `({ valueOf }) => valueOf(p.other)` |
| Conditional | `required(p.x, { when: ctx => … })` or `applyWhen(p, ctx => …, (p) => { … })` |
| Async | `validateAsync(p.x, { params, factory, onSuccess, onError })` / `validateHttp(…)` |
| Wait for typing | `debounce(p.x, 300)` |
| UI state | `disabled(p.x, ctx => 'reason' \| false)` · `hidden(…)` · `readonly(…)` |
| Reuse | `const addressSchema = schema<Address>(p => { … }); apply(p.address, addressSchema)` |
| Arrays | `applyEach(p.items, itemSchema)` |

## 4. Submit
```ts
form(model, rules, { submission: { action: async (f) => {
  const res = await api.save(f().value());
  return res.ok ? undefined : { fieldTree: f.email, kind: 'server', message: res.error };
}}});
```
```html
<form [formRoot]="myForm"> … <button type="submit">Save</button></form>
```

## 5. Migrating from Reactive Forms
- **Bottom-up:** `new SignalFormControl(initial, rules)` inside an existing `FormGroup` (`@angular/forms/signals/compat`)
- **Top-down:** `compatForm(signal({ name: '', legacy: new FormControl('') }))`

Docs: angular.dev/guide/forms/signals
