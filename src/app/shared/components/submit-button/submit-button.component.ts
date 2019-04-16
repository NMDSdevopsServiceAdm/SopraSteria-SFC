import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  onClick(action: string, save: boolean) {
    this.clicked.emit({ action, save });
  }
}
