import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent implements OnInit {
  @Input() set worker(value: Worker) {
    this._worker = value;
  }

  get worker(): Worker {
    return this._worker;
  }

  @Input() workplace: Establishment;
  @Input() return: URLStructure;
  @Input() wdfView = false;

  private _worker: Worker;
  private workplaceUid: string;
  public canEditWorker: boolean;
  public returnTo: URLStructure;

  constructor(
    private location: Location,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    public workerService: WorkerService
  ) {}

  ngOnInit() {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
    this.returnTo = this.wdfView
      ? { url: [...staffRecordPath, ...['wdf-summary']] }
      : { url: [...staffRecordPath, ...['check-answers']] };

    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
  }

  setReturn() {
    this.workerService.setReturnTo(this.return);
  }

  public getRoutePath(name: string) {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, name];
  }
}
