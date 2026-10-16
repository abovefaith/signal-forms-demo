# Type-Safe and Signal-Driven: The Future of Angular Forms

Demo app for Faith Kawira's talk at **GDG Soweto**. Angular 22 · Signal Forms (`@angular/forms/signals`).

```bash
npm install
npm start        # http://localhost:4200
```

Requires Node 22.22.3+ or 24.15+.

| Tab | File | What it shows |
|---|---|---|
| 🎤 Live | `src/app/live/live-coding.ts` | Empty starter — we build it together |
| 1 · Before | `demos/01-reactive-before.ts` | Classic Reactive Forms + RxJS |
| 2 · Basics | `demos/02-signal-basics.ts` | `form()`, `[formField]`, schema validators, `computed` |
| 3 · Dynamic | `demos/03-dynamic-validation.ts` | `hidden`, `required({when})`, `applyWhen`, cross-field `validate`, `disabled` with reasons |
| 4 · Async + Submit | `demos/04-async-and-submit.ts` | `validateAsync` + `resource`, `debounce`, `submit` with server errors, `[formRoot]` |
| 5 · Interop | `demos/05-interop.ts` | `SignalFormControl` inside an existing `FormGroup` |

Speaker's step-by-step guide: [`LIVE-CODING-SCRIPT.md`](LIVE-CODING-SCRIPT.md) · Audience handout: [`CHEATSHEET.md`](CHEATSHEET.md)

Try it: usernames `faith`, `gdg`, `soweto` are "taken"; email `taken@gdg.dev` triggers a server error.
# signal-forms-demo
