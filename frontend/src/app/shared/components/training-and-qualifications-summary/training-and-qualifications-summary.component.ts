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
  @Input() sortByValue: string;

  @Output() changeStaffSortBy = new EventEmitter<{ section: string; sortByValue: string }>();

  public canViewWorker: boolean;
  public sortTrainingAndQualsOptions: Record<string, string>;
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
    this.paginatedWorkers = this.workers;
    this.totalWorkerCount = this.workerCount;
    this.setSearchIfPrevious();
    this.getPageOfWorkers({
      index: 0,
      itemsPerPage: 15,
      searchTerm: this.searchTerm,
      sortByValue: this.sortByValue,
    });
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    const tab = this.route.snapshot.queryParamMap.get('tab');

    if (search && tab === 'training') {
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
        this.changeStaffSortBy.emit({ section: 'staff-summary', sortByValue: sortByValue });
      });
  }

  public getWorkerTrainingAndQualificationsPath(event: Event, worker: Worker): void {
    event.preventDefault();
    const path = this.wdfView
      ? ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training', 'wdf-summary']
      : ['/workplace', this.workplace.uid, 'training-and-qualifications-record', worker.uid, 'training'];
    this.router.navigate(path, { fragment: 'all-records' });
  }
}
