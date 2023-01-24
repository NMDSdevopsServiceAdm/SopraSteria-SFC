import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, SortTrainingAndQualsOptionsWorker } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-summary',
  templateUrl: './training-and-qualifications-summary.component.html',
})
export class TrainingAndQualificationsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() workerCount: number;
  @Input() wdfView = false;
  @Input() showViewByToggle = false;
  @Input() totalRecords: number;

  @Output() viewTrainingByCategory: EventEmitter<boolean> = new EventEmitter();

  public canViewWorker: boolean;
  public sortTrainingAndQualsOptions: Record<string, string>;
  public sortByValue: string;
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  public paginatedWorkers: Array<Worker>;
  public searchTerm = '';
  public totalWorkerCount: number;
  public sortByParamMap = {
    '0_expired': 'trainingExpired',
    '1_expires_soon': 'trainingExpiringSoon',
    '2_missing': 'trainingMissing',
    '3_worker': 'staffNameAsc',
  };

  constructor(
    private permissionsService: PermissionsService,
    private router: Router,
    private workerService: WorkerService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.sortTrainingAndQualsOptions = SortTrainingAndQualsOptionsWorker;
    this.sortByValue = '0_expired';
    this.paginatedWorkers = this.workers;
    this.totalWorkerCount = this.workerCount;
    this.setSearchIfPrevious();
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    const tab = this.route.snapshot.queryParamMap.get('tab');

    if (search && tab === 'training') {
      this.searchTerm = search;
    }
  }

  // private setSortValue(value: string): void {
  //   this.sortByValue = value;
  // }

  // private setPageIndex(pageIndex: number): void {
  //   this.currentPageIndex = pageIndex;
  //   this.refetchWorkers();
  // }

  // private refetchWorkers(): void {
  //   const sortByParamMap = {
  //     '0_expired': 'trainingExpired',
  //     '1_expires_soon': 'trainingExpiringSoon',
  //     '2_missing': 'trainingMissing',
  //     '3_worker': 'staffNameAsc',
  //   };

  //   this.workerService
  //     .getAllWorkers(this.workplace.uid, {
  //       sortBy: sortByParamMap[this.sortByValue],
  //       pageIndex: this.currentPageIndex,
  //       itemsPerPage: this.itemsPerPage,
  //       ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
  //     })
  //     .pipe(take(1))
  //     .subscribe(({ workers, workerCount }) => {
  //       this.paginatedWorkers = workers;

  //       this.workerCount = workerCount;
  //     });
  // }

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

  // public handleSortUpdate(dropdownValue: string): void {
  //   if (dropdownValue !== this.sortByValue) {
  //     this.setSortValue(dropdownValue);
  //     this.setPageIndex(0);
  //   }
  // }

  // public handlePageUpdate(pageIndex: number): void {
  //   if (pageIndex !== this.currentPageIndex) {
  //     this.setPageIndex(pageIndex);
  //   }
  // }

  public getWorkerTrainingAndQualificationsPath(event: Event, worker: Worker): void {
    event.preventDefault();

    const path = ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    this.router.navigate(this.wdfView ? [...path, 'wdf-summary'] : path);
  }

  // private addQueryParams(): void {
  //   this.router.navigate([], {
  //     fragment: 'training-and-qualifications',
  //     queryParams: { search: this.searchTerm, tab: 'training' },
  //     queryParamsHandling: 'merge',
  //   });
  // }

  // public handleSearch(searchTerm: string): void {
  //   this.searchTerm = searchTerm;
  //   this.addQueryParams();
  //   this.setPageIndex(0);
  // }
}
