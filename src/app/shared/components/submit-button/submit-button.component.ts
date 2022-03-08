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
  @Input() canExit = true;
  @Input() exitText = 'Exit';
  @Input() isExistingStaffRecord = true;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  onClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }
}
