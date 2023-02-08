import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit, AfterViewInit {
  @ViewChild('table') table: ElementRef;
  @ViewChild(SearchInputComponent) searchInput: SearchInputComponent;

  public workers: Array<Worker>;
  public form: FormGroup;
  public submitted: boolean;
  public primaryWorkplaceUid: string;
  public returnLink: Array<string>;
  public selectAll = false;
  public errorsMap: Array<ErrorDetails>;
  public workplaceUid: string;
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  public totalWorkerCount: number;
  public showSearchBar: boolean;
  public sortByValue = 'staffNameAsc';
  public paginatedWorkers: Worker[];
  private searchTerm = '';
  public searchResults: Worker[];
  public errorMessage = 'Select the staff who have completed the training';
  public error = false;
  public submitButtonText: string;
  public accessedFromSummary = false;
  public selectedWorkers: string[] = [];

  constructor(
    public backLinkService: BackLinkService,
    public trainingService: TrainingService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.workers = this.route.snapshot.data.workers.workers;
    this.totalWorkerCount = this.workers.length;
    this.getPageOfWorkers();
    this.showSearchBar = this.totalWorkerCount > this.itemsPerPage;
    this.prefill();
    this.setupErrorsMap();
    this.setReturnLink();
    this.setBackLink();
    this.accessedFromSummary = this.route.snapshot.parent.url[0].path.includes('confirm-training');
    this.submitButtonText = this.accessedFromSummary ? 'Save and return' : 'Continue';
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.table);
  }

  private prefill(): void {
    this.selectedWorkers = this.trainingService.selectedStaff.map((worker) => worker.uid);
    this.updateSelectAllLinks();
  }

  public getPageOfWorkers(): void {
    this.workerService
      .getAllWorkers(this.workplaceUid, {
        pageIndex: this.currentPageIndex,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.sortByValue,
      })
      .pipe(take(1))
      .subscribe(({ workers }) => {
        this.paginatedWorkers = workers;
      });
  }

  public getSearchResults(): void {
    if (this.searchTerm) {
      this.workerService
        .getAllWorkers(this.workplaceUid, {
          pageIndex: this.currentPageIndex,
          itemsPerPage: this.itemsPerPage,
          sortBy: this.sortByValue,
          ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
        })
        .pipe(take(1))
        .subscribe(({ workers }) => {
          this.searchResults = workers;
        });
    } else {
      this.searchResults = undefined;
    }
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;
    this.getPageOfWorkers();
  }

  private setupErrorsMap(): void {
    this.errorsMap = [
      {
        item: 'selectStaff',
        type: [
          {
            name: 'selectStaffRequired',
            message: 'Select who you want to add a record for',
          },
        ],
      },
    ];
  }

  public setReturnLink(): void {
    this.returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public selectAllWorkers(event: Event): void {
    event.preventDefault();
    if (this.selectedWorkers.length > 1) {
      this.selectAll = false;
      this.selectedWorkers = [];
    } else {
      this.selectAll = true;
      this.selectedWorkers = this.workers.map((worker) => worker.uid);
    }
  }

  public selectWorker(event: Event, workerId: string): void {
    event.preventDefault();
    if (this.selectedWorkers.includes(workerId)) {
      const index = this.selectedWorkers.indexOf(workerId);
      this.selectedWorkers.splice(index, 1);
    } else {
      this.selectedWorkers.push(workerId);
    }
    this.updateSelectAllLinks();
  }

  public updateSelectAllLinks(): void {
    this.selectAll = this.selectedWorkers?.length === this.workers.length;
  }

  private updateSelectedStaff(): void {
    const workers = this.selectAll
      ? this.workers
      : this.workers.filter((worker) => this.selectedWorkers.includes(worker.uid));

    this.trainingService.updateSelectedStaff(workers);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.error = false;
    this.errorSummaryService.syncErrorsEvent.next(true);

    if (this.selectedWorkers.length > 0) {
      this.updateSelectedStaff();
      const nextRoute = this.getNextRoute();
      this.trainingService.addMultipleTrainingInProgress$.next(true);
      this.router.navigate(['workplace', this.workplaceUid, 'add-multiple-training', nextRoute]);
    } else {
      this.error = true;
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private getNextRoute(): string {
    return this.accessedFromSummary ? 'confirm-training' : 'training-details';
  }

  handleSearch(searchTerm: string): void {
    const prevPageIndex = this.currentPageIndex;
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
    this.addQueryParams();
    this.getSearchResults();
    this.currentPageIndex = prevPageIndex;
  }

  private addQueryParams(): void {
    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    if (this.accessedFromSummary) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.trainingService.resetSelectedStaff();
      this.router.navigate(this.returnLink, { fragment: 'training-and-qualifications' });
    }
  }

  public handleResetSearch(event: Event): void {
    event.preventDefault();
    this.searchInput.handleResetSearch();
  }
}
