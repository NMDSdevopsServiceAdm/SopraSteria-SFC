import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction: string = 'Save and continue';
  @Input() recordSummary: boolean = true;
  @Input() canExit: boolean = true;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  onClick(event: Event, action: string, save: boolean) {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }
}
