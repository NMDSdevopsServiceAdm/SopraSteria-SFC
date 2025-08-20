import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, SortStaffOptions, WdfSortStaffOptions } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { SortByService } from '@core/services/sort-by.service';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive({})
export class StaffSummaryDirective implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() workerCount: number;

  public wdfView = false;
  public subscriptions: Subscription = new Subscription();
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
    '3_last_update_newest': 'lastUpdateNewest',
    '3_last_update_oldest': 'lastUpdateOldest',
    '4_add_more_details': 'addMoreDetails',
  };
  public searchLabel = 'Search by name or ID number';
  public pageIndex = 0;
  public isSearchMaintained: boolean;
  public maintainedPageIndex: number;

  constructor(
    protected permissionsService: PermissionsService,
    protected workerService: WorkerService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected tabsService: TabsService,
    protected sortByService: SortByService,
  ) {}

  ngOnInit(): void {
    if (!this.wdfView) {
      const { staffSummarySortValue, staffSummarySearchTerm, staffSummaryIndex, isSearchMaintained } =
        this.sortByService.returnLocalStorageForSort();

      const staffSummaryIndexInteger = Number(staffSummaryIndex);

      this.sortByValue = staffSummarySortValue ?? 'staffNameAsc';
      this.searchTerm = staffSummarySearchTerm ?? '';
      this.pageIndex = Number.isInteger(staffSummaryIndexInteger) ? staffSummaryIndexInteger : 0;
      this.isSearchMaintained = isSearchMaintained === 'true' ? true : false;
    }

    this.totalWorkerCount = this.workerCount;
    this.paginatedWorkers = this.workers;
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.sortStaffOptions = this.wdfView ? WdfSortStaffOptions : SortStaffOptions;
    this.getPageOfWorkers({
      index: this.pageIndex,
      itemsPerPage: 15,
      searchTerm: this.searchTerm,
      sortByValue: this.sortByValue,
    });
    this.init();
  }

  protected init(): void {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: dayjs.Dayjs = dayjs(timestamp);
    const isToday: boolean = dayjs().isSame(lastUpdated, 'day');

    return isToday ? 'Today' : lastUpdated.format('D MMM YYYY');
  }

  protected getPageOfWorkers(properties: {
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }): void {
    const { index, itemsPerPage, searchTerm, sortByValue } = properties;
    this.sortByValue = sortByValue;

    if (!this.wdfView) {
      this.isSearchMaintained = true;
      this.maintainedPageIndex = index;

      localStorage.setItem('staffSummarySortValue', this.sortByValue);
      localStorage.setItem('staffSummarySearchTerm', searchTerm);
      localStorage.setItem('staffSummaryIndex', index.toString());
      localStorage.setItem('isSearchMaintained', this.isSearchMaintained.toString());
    }

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
