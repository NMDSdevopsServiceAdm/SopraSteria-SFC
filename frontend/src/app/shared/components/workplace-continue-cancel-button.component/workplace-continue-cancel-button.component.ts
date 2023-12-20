import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-workplace-continue-cancel-button',
  templateUrl: './workplace-continue-cancel-button.component.html',
})
export class WorkplaceContinueCancelButtonComponent {
  @Input() marginTop4 = false;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  onLinkClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }

  onButtonClick(action: string, save: boolean): void {
    this.clicked.emit({ action, save });
  }
}
