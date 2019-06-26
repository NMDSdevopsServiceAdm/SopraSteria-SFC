import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent {
  public returnTo: URLStructure;
  @Input() set worker(value: Worker) {
    this._worker = value;
    this.returnTo = { url: ['/worker', this.worker.uid, 'check-answers'] };
  }
  @Input() return: URLStructure;
  private _worker: Worker;

  get worker(): Worker {
    return this._worker;
  }

  constructor(private location: Location, public workerService: WorkerService) {}

  goBack(event) {
    event.preventDefault();

    this.location.back();
  }

  setReturn() {
    console.log(this.return);
    this.workerService.setReturnTo(this.return);
  }
}
