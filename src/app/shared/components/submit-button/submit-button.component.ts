import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Output() click = new EventEmitter<{ action: string; save: boolean }>();

  onClick(action: string, save: boolean) {
    this.click.emit({ action, save });
  }
}
