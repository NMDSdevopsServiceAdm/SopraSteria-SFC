import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-start-button',
  templateUrl: './start-button.component.html',
})
export class StartButtonComponent {
  @Input() link: string;
  @Input() title = 'Start now';

  constructor() {}
}
