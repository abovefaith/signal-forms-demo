# Type-Safe and Signal-Driven: The Future of Angular Forms

Demo app for Faith Kawira's talk at **GDG Soweto**. Angular 22 · Signal Forms (`@angular/forms/signals`).

```bash
npm install
npm start        # http://localhost:4200
```

Requires Node 22.22.3+ or 24.15+.

| Tab | File | What it shows |
|---|---|---|
| Live | `src/app/live/live-coding.ts` | Empty file where Demo 2 is built live |
| 1 · Before | `demos/01-reactive-before.ts` | The old way: Reactive Forms + RxJS |
| 2 · Basics | `demos/02-signal-basics.ts` | Model, form, rules, errors, `computed` |
| 3 · Dynamic | `demos/03-dynamic-validation.ts` | Hidden fields, conditional rules, comparing two fields, disabled fields |
| 4 · Async + Submit | `demos/04-async-and-submit.ts` | Checking with a server, submitting, server errors |
| 5 · Interop | `demos/05-interop.ts` | A Signal Forms field inside an existing `FormGroup` |

Presenter script: [`LIVE-CODING-SCRIPT.md`](LIVE-CODING-SCRIPT.md) · Audience handout: [`CHEATSHEET.md`](CHEATSHEET.md)

Try it: usernames `faith`, `gdg` and `soweto` are taken. The email `taken@gdg.dev` triggers a server error.
