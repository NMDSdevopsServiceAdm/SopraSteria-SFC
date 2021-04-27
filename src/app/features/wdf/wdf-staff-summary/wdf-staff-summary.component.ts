import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Establishment, WdfSortStaffOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-staff-summary',
  templateUrl: './wdf-staff-summary.component.html',
})
export class WdfStaffSummaryComponent implements OnInit, OnChanges {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public sortStaffOptions;
  public workersOrderBy: Array<Worker>;
  public overallWdfEligibility: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private permissionsService: PermissionsService, private reportService: ReportService) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: moment.Moment = moment(timestamp);
    const isToday: boolean = moment().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(worker: Worker) {
    return ['/wdf', 'staff-record', worker.uid];
  }

  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = WdfSortStaffOptions;
    this.getOverallWdfEligibility();
  }

  ngOnChanges() {
    this.workers = this.workers.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
  }

  public sortByColumn(selectedColumn: any) {
    switch (selectedColumn) {
      case '0_asc': {
        this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
        break;
      }
      case '0_dsc': {
        this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['desc']);
        break;
      }
      case '1_asc': {
        this.workers = orderBy(this.workers, [(worker) => worker.jobRole.toLowerCase()], ['asc']);
        break;
      }
      case '1_dsc': {
        this.workers = orderBy(this.workers, [(worker) => worker.jobRole.toLowerCase()], ['desc']);
        break;
      }
      case '2_meeting': {
        this.workers = orderBy(this.workers, [(worker) => worker.wdfEligible], ['desc']);
        break;
      }
      case '2_not_meeting': {
        this.workers = orderBy(this.workers, [(worker) => worker.wdfEligible], ['asc']);
        break;
      }
      default: {
        this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
        break;
      }
    }
  }

  private getOverallWdfEligibility() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.overallWdfEligibility = report.wdf.overall;
      }),
    );
  }
}
