// Live coding: we build Demo 2 here, on stage.
// The finished version is demos/02-signal-basics.ts.
import { Component, signal } from '@angular/core';
import { demoStyles } from '../shared/styles';

@Component({
  selector: 'app-live',
  imports: [],
  styles: demoStyles,
  template: `
    <h2>Live: GDG Soweto registration</h2>
    <form>
      <!-- we'll build this together -->
    </form>
  `,
})
export class LiveCoding {}
