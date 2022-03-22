import { Component, Input, OnInit } from '@angular/core';
import { Establishment, SortStaffOptions, WdfSortStaffOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-staff-summary',
  templateUrl: './staff-summary.component.html',
})
export class StaffSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() workerCount: number;
  @Input() wdfView = false;

  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public sortStaffOptions;
  public workersOrderBy: Array<Worker>;
  public currentPageIndex = 0;
  public paginatedWorkers: Array<Worker>;
  private sortByValue = 'staffNameAsc';
  public itemsPerPage = 15;

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

  ngOnInit(): void {
    this.paginatedWorkers = this.workers;
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = this.wdfView ? WdfSortStaffOptions : SortStaffOptions;
  }

  public sortBy(sortType: string): void {
    const sortByParamMap = {
      '0_asc': 'staffNameAsc',
      '0_dsc': 'staffNameDesc',
      '1_asc': 'jobRoleAsc',
      '1_dsc': 'jobRoleDesc',
      '2_meeting': 'wdfMeeting',
      '2_not_meeting': 'wdfNotMeeting',
    };

    this.sortByValue = sortByParamMap[sortType];
    this.currentPageIndex = 0;
    this.getPageOfWorkers();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
    this.getPageOfWorkers();
  }

  public getPageOfWorkers(): void {
    this.workerService
      .getAllWorkers(this.workplace.uid, {
        pageIndex: this.currentPageIndex,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortByValue,
      })
      .pipe(take(1))
      .subscribe(({ workers, workerCount }) => {
        this.paginatedWorkers = workers;
        this.workerCount = workerCount;
      });
  }
}
