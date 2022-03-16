import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Establishment, SortStaffOptions, WdfSortStaffOptions } from '@core/model/establishment.model';
import { PaginationEmission } from '@core/model/pagination.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import orderBy from 'lodash/orderBy';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-staff-summary',
  templateUrl: './staff-summary.component.html',
})
export class StaffSummaryComponent implements OnInit, OnChanges {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() wdfView = false;
  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public sortStaffOptions;
  public workersOrderBy: Array<Worker>;

  constructor(private permissionsService: PermissionsService, private workerService: WorkerService) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: dayjs.Dayjs = dayjs(timestamp);
    const isToday: boolean = dayjs().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(worker: Worker) {
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid];
    return this.wdfView ? [...path, ...['wdf-summary']] : path;
  }

  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = this.wdfView ? WdfSortStaffOptions : SortStaffOptions;
  }

  ngOnChanges() {
    //Adding jobRole attrubute to solve sorting by using only
    //this property instead of itrating over the nested mainJob object
    this.workers = this.workers.map((worker) => {
      worker.jobRole = worker.mainJob.other ? worker.mainJob.other : worker.mainJob.title;
      return worker;
    });
    this.workers = orderBy(this.workers, [(worker) => worker.nameOrId.toLowerCase()], ['asc']); //sorting by default on first column
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

  public getPageOfWorkers(paginationEmission: PaginationEmission): void {
    this.workerService
      .getAllWorkers(this.workplace.uid, paginationEmission)
      .pipe(take(1))
      .subscribe((res) => {
        this.workers = res.workers;
      });
  }
}
