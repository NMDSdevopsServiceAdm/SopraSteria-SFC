import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UrlTree } from '@angular/router';

@Component({
  selector: 'app-update-banner',
  templateUrl: './update-banner.component.html',
  styleUrl: './update-banner.component.scss',
  standalone: false,
})
export class UpdateBannerComponent {
  @Input() linkText: string;
  @Input() routerLink: UrlTree | string | string[];
  @Output() linkClicked = new EventEmitter();

  public handleLinkClick(event: Event) {
    event.preventDefault();
    this.linkClicked.emit();
  }
}
