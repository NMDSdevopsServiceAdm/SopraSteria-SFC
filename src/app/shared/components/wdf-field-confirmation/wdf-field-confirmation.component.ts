import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wdf-field-confirmation',
  templateUrl: './wdf-field-confirmation.component.html',
  styleUrls: ['./wdf-field-confirmation.component.scss'],
})
export class WdfFieldConfirmationComponent {
  @Input() changeLink: any[];
  @Output() fieldConfirmation: EventEmitter<Event> = new EventEmitter();
  @Output() setReturnClicked: EventEmitter<Event> = new EventEmitter();

  public confirmButtonClicked = false;

  confirmField() {
    this.fieldConfirmation.emit();
    this.confirmButtonClicked = true;
  }

  setReturn() {
    this.setReturnClicked.emit();
  }
}
