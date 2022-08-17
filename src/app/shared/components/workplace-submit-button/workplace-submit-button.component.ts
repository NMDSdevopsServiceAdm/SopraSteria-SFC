import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-workplace-submit-button',
  templateUrl: './workplace-submit-button.component.html',
})
export class WorkplaceSubmitButtonComponent {
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction = 'Save and continue';
  @Input() recordSummary = true;
  @Input() canExit = false;
  @Input() exitText = 'Cancel';
  @Input() reducedMargin = false;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();

  onLinkClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }

  onButtonClick(action: string, save: boolean): void {
    this.clicked.emit({ action, save });
  }
}
