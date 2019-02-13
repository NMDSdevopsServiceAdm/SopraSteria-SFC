import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-blank-card',
  template: `
    <div class="main-page-container col-12">
      <div id="back" class="back-link">
        <a (click)="backClick($event)"> <span class="arrow"></span>Back </a>
      </div>
      <h1>Blank Card</h1>
    </div>
  `,
})
export class BlankCardComponent {
  constructor(private _location: Location) {}

  backClick(event) {
    this._location.back();
  }
}
