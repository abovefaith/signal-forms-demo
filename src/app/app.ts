import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: `
    nav { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; padding:16px; font-family:system-ui; }
    a { padding:6px 12px; border-radius:999px; text-decoration:none; color:#3c4043; background:#f1f3f4; font-size:14px; }
    a.active { background:#4285F4; color:#fff; }
    main { padding:8px 16px 48px; }
  `,
  template: `
    <nav>
      <a routerLink="/live" routerLinkActive="active">Live</a>
      <a routerLink="/before" routerLinkActive="active">1 · Before</a>
      <a routerLink="/basics" routerLinkActive="active">2 · Basics</a>
      <a routerLink="/dynamic" routerLinkActive="active">3 · Dynamic</a>
      <a routerLink="/async" routerLinkActive="active">4 · Async + Submit</a>
      <a routerLink="/interop" routerLinkActive="active">5 · Interop</a>
    </nav>
    <main><router-outlet /></main>
  `,
})
export class App {}
