import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wdf-field-confirmation',
  templateUrl: './wdf-field-confirmation.component.html',
})
export class WdfFieldConfirmationComponent {
  @Input() changeLink: any[];
  @Output() fieldConfirmation: EventEmitter<Event> = new EventEmitter();

  confirmField() {
    this.fieldConfirmation.emit();
  }
}
