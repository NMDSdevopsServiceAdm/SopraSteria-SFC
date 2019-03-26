import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html',
})
export class BackLinkComponent {
  @Input() routerLink: any[] | string;
  @Input() fragment!: string;

  constructor(private location: Location) {}

  back(event) {
    event.preventDefault();
    this.location.back();
  }
}
