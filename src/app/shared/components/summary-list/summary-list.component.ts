import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryList } from '@core/model/summary-list.model';

@Component({
  selector: 'app-summary-list',
  templateUrl: './summary-list.component.html',
})
export class SummaryListComponent {
  @Input() public summaryList: SummaryList[];
  @Input() public topBorder?: boolean;
  @Input() public wrapBorder?: boolean;
  @Output() public setReturn = new EventEmitter();

  public emitSetReturn(): void {
    this.setReturn.emit();
  }
}
