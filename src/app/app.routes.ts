import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'live' },
  { path: 'live', loadComponent: () => import('./live/live-coding').then((m) => m.LiveCoding) },
  { path: 'before', loadComponent: () => import('./demos/01-reactive-before').then((m) => m.ReactiveBefore) },
  { path: 'basics', loadComponent: () => import('./demos/02-signal-basics').then((m) => m.SignalBasics) },
  { path: 'dynamic', loadComponent: () => import('./demos/03-dynamic-validation').then((m) => m.DynamicValidation) },
  { path: 'async', loadComponent: () => import('./demos/04-async-and-submit').then((m) => m.AsyncSubmit) },
  { path: 'interop', loadComponent: () => import('./demos/05-interop').then((m) => m.Interop) },
];
