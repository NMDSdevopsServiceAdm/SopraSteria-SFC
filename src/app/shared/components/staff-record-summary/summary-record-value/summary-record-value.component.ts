import { Component, Input } from '@angular/core';
import { Worker } from '@core/model/worker.model';

@Component({
  selector: 'app-summary-record-value',
  templateUrl: './summary-record-value.component.html',
})
export class SummaryRecordValueComponent {
  @Input() wdfView: boolean;
  @Input() wdfValue: string;
  @Input() worker: Worker;

  get isWdfOutdated() {
    return this.wdfView && !this.worker.wdf.currentEligibility && this.worker.wdf.lastEligibility !== null;
  }
}
