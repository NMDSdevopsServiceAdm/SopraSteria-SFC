import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  public totalWorkerCount: number;
  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public sortStaffOptions;
  public workersOrderBy: Array<Worker>;
  public paginatedWorkers: Array<Worker>;
  public sortByValue = 'staffNameAsc';
  public searchTerm = '';
  public sortByParamMap = {
    '0_asc': 'staffNameAsc',
    '0_dsc': 'staffNameDesc',
    '1_asc': 'jobRoleAsc',
    '1_dsc': 'jobRoleDesc',
    '2_meeting': 'wdfMeeting',
    '2_not_meeting': 'wdfNotMeeting',
  };

  constructor(
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: dayjs.Dayjs = dayjs(timestamp);
    const isToday: boolean = dayjs().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(event: Event, worker: Worker) {
    event.preventDefault();
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid, 'staff-record-summary'];
    this.router.navigate(this.wdfView ? [...path, 'wdf-summary'] : path);
  }

  ngOnInit(): void {
    this.totalWorkerCount = this.workerCount;
    this.paginatedWorkers = this.workers;
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = this.wdfView ? WdfSortStaffOptions : SortStaffOptions;
    this.setSearchIfPrevious();
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    const tab = this.route.snapshot.queryParamMap.get('tab');

    if (search && tab === 'staff') {
      this.searchTerm = search;
    }
  }

  public getPageOfWorkers(properties: {
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }): void {
    const { index, itemsPerPage, searchTerm, sortByValue } = properties;
    this.workerService
      .getAllWorkers(this.workplace.uid, {
        pageIndex: index,
        itemsPerPage: itemsPerPage,
        sortBy: sortByValue,
        ...(searchTerm ? { searchTerm } : {}),
      })
      .pipe(take(1))
      .subscribe(({ workers, workerCount }) => {
        this.paginatedWorkers = workers;
        this.workerCount = workerCount;
      });
  }
}
