import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  template: '<router-outlet></router-outlet>',
})
export class TestRootComponent {
  @ViewChild(RouterOutlet)
  routerOutlet: RouterOutlet;
}
