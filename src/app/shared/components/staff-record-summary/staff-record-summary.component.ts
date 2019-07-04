import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent implements OnInit {
  @Input() set worker(value: Worker) {
    this._worker = value;
  }
  @Input() return: URLStructure;
  @Input() wdfReportEnabled = false;

  public returnTo: URLStructure;
  private _worker: Worker;

  constructor(private location: Location, public workerService: WorkerService) {}

  ngOnInit() {
    this.returnTo = this.wdfReportEnabled
      ? { url: ['/reports', 'wdf', 'worker', this.worker.uid] }
      : { url: ['/worker', this.worker.uid, 'check-answers'] };
  }

  goBack(event) {
    event.preventDefault();
    this.location.back();
  }

  setReturn() {
    this.workerService.setReturnTo(this.return);
  }

  get worker(): Worker {
    return this._worker;
  }
}
