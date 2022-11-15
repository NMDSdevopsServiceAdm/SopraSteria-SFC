import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent implements OnInit {
  @Input() showSaveAndCancelButton = false; // delete
  @Input() return: boolean;
  @Input() saveCallback: any;
  @Input() callToAction = 'Save and continue';
  @Input() recordSummary = true;
  @Input() canExit = false;
  @Input() exitText = 'Cancel';
  @Input() isExistingStaffRecord = true;
  @Input() summaryContinue = false;
  @Output() clicked = new EventEmitter<{ action: string; save: boolean }>();
  public summaryActionType = 'return';

  ngOnInit(): void {
    if (this.summaryContinue) {
      this.summaryActionType = 'continue';
    }
  }

  onLinkClick(event: Event, action: string, save: boolean): void {
    event.preventDefault();
    this.clicked.emit({ action, save });
  }

  onButtonClick(action: string, save: boolean): void {
    this.clicked.emit({ action, save });
  }
}
