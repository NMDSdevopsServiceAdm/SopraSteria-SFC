import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction = 'Save and continue';
  @Input() recordSummary = true;
  @Input() canExit = false;
  @Input() exitText = 'Cancel';
  @Input() isExistingStaffRecord = true;
  @Output() clicked = new EventEmitter<{ event: Event; action: string; save: boolean }>();

  onClick(event: Event, action: string, save: boolean): void {
    this.clicked.emit({ event, action, save });
  }
}
