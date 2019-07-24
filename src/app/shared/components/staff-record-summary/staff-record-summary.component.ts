import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
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
  @Input() workplace: Establishment;
  @Input() return: URLStructure;
  @Input() wdfView = false;

  public returnTo: URLStructure;
  private _worker: Worker;

  constructor(private location: Location, public workerService: WorkerService) {}

  ngOnInit() {
    const staffRecordPath = ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid];
    this.returnTo = this.wdfView
      ? { url: [...staffRecordPath, ...['wdf-summary']] }
      : { url: [...staffRecordPath, ...['check-answers']] };
  }

  goBack(event) {
    event.preventDefault();
    this.location.back();
  }

  setReturn() {
    this.workerService.setReturnTo(this.return);
  }

  public getRoutePath(name: string) {
    return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, name];
  }

  get worker(): Worker {
    return this._worker;
  }
}
