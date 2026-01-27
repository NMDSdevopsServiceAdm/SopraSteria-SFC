import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-menu',
  standalone: false,
  templateUrl: './button-menu.component.html',
})
export class ButtonMenuComponent {
  @Input() buttonText: string = 'Button Text';

  public menuOpen: boolean = false;

  public toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
