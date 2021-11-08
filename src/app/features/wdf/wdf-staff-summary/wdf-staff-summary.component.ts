import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment, WdfSortStaffOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ReportService } from '@core/services/report.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wdf-staff-summary',
  templateUrl: './wdf-staff-summary.component.html',
})
export class WdfStaffSummaryComponent implements OnInit, OnChanges {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() canEditWorker: boolean;
  public workplaceUid: string;
  public primaryWorkplaceUid: string;
  public canViewWorker: boolean;
  public sortStaffOptions;
  public sortBy: string;
  public overallWdfEligibility: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
  ) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated = dayjs(timestamp);
    const isToday: boolean = dayjs().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(worker: Worker) {
    if (this.route.snapshot.params.establishmentuid) {
      this.workplaceUid = this.route.snapshot.params.establishmentuid;
      return ['/wdf', 'workplaces', this.workplaceUid, 'staff-record', worker.uid];
    } else {
      this.workplaceUid = this.establishmentService.primaryWorkplace.uid;
      return ['/wdf', 'staff-record', worker.uid];
    }
  }

  ngOnInit() {
    this.sortStaffOptions = WdfSortStaffOptions;
    this.getOverallWdfEligibility();
    this.restoreSortBy();
    this.saveWorkerList();
  }

  ngOnChanges() {
    this.workers = this.workers.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']);
    this.restoreSortBy();
    this.saveWorkerList();
  }

  public saveWorkerList() {
    const listOfWorkerUids = this.workers.map((worker) => worker.uid);
    localStorage.setItem('ListOfWorkers', JSON.stringify(listOfWorkerUids));
  }

  public restoreSortBy() {
    this.sortBy = localStorage.getItem('SortBy');
    if (this.sortBy) {
      this.sortByColumn(this.sortBy);
    }
  }

  public sortByColumn(selectedColumn: any) {
    localStorage.setItem('SortBy', selectedColumn);
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
    this.saveWorkerList();
  }

  private getOverallWdfEligibility() {
    this.subscriptions.add(
      this.reportService.getWDFReport(this.workplace.uid).subscribe((report) => {
        this.overallWdfEligibility = report.wdf.overall;
      }),
    );
  }
}
