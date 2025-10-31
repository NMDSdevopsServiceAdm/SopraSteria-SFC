import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-summary-record-change',
    templateUrl: './summary-record-change.component.html',
    standalone: false
})
export class SummaryRecordChangeComponent {
  @Input() explanationText: string;
  @Input() link: any[];
  @Input() hasData: boolean;
  @Output() setReturnClicked: EventEmitter<Event> = new EventEmitter();

  setReturn() {
    this.setReturnClicked.emit();
  }

}
