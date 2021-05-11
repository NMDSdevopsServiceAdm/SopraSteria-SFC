import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

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
  @Input() overallWdfEligibility: boolean;

  private _worker: Worker;
  private workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public returnTo: URLStructure;
  public wdfNewDesign: boolean;

  constructor(
    private location: Location,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    public workerService: WorkerService,
    private featureFlagsService: FeatureFlagsService
  ) {}

  ngOnInit() {
    this.workplaceUid = this.workplace.uid;

    const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
    this.returnTo = this.wdfView
      ? { url: [...staffRecordPath, ...['wdf-summary']] }
      : { url: [...staffRecordPath, ...['check-answers']] };

    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');

    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.wdfNewDesign = value;
    });
    console.log(this.worker);
  }

  setReturn() {
    this.workerService.setReturnTo(this.return);
  }

  public getRoutePath(name: string) {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, name];
  }

  public confirmField(dataField) {
    const props = { [dataField]: this.worker[dataField] };

    this.subscriptions.add(
      this.workerService
        .updateWorker(this.workplace.uid, this.worker.uid, props)
        .subscribe((data) => console.log(data)),
    );
  }
}
