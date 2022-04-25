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
  public currentPageIndex = 0;
  public paginatedWorkers: Array<Worker>;
  private sortByValue = 'staffNameAsc';
  public itemsPerPage = 15;
  private searchTerm = '';

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
    this.addQueryParams();
    const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid];
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
        ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
      })
      .pipe(take(1))
      .subscribe(({ workers, workerCount }) => {
        this.paginatedWorkers = workers;
        this.workerCount = workerCount;
      });
  }

  private addQueryParams(): void {
    this.router.navigate([], {
      fragment: 'staff-records',
      queryParams: { search: this.searchTerm, tab: 'staff' },
      queryParamsHandling: 'merge',
    });
  }

  public handleSearch(searchTerm: string): void {
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
    this.addQueryParams();
    this.getPageOfWorkers();
  }
}
