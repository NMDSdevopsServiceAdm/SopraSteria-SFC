import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';

@Component({
  selector: 'app-summary-record-value',
  templateUrl: './summary-record-value.component.html',
})
export class SummaryRecordValueComponent {
  @Input() wdfView: boolean;
  @Input() wdfValue: string;
  @Input() item: Worker | Establishment;

  /**
   * TODO: Implement isOutdated logic
   */
  get isWdfOutdated() {
    return false;
    // return this.wdfView && !this.item.wdf.currentEligibility && this.item.wdf.lastEligibility !== null;
  }
}
