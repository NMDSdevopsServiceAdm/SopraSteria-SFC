import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
export class SelectStaffComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild(SearchInputComponent) searchInput: SearchInputComponent;

  public workers: Array<Worker>;
  public form: FormGroup;
  public submitted: boolean;
  public primaryWorkplaceUid: string;
  public returnLink: Array<string>;
  public selectAll = false;
  private formErrorsMap: Array<ErrorDetails>;
  private workplaceUid: string;
  public itemsPerPage = 15;
  public currentPageIndex = 0;
  public totalWorkerCount: number;
  public showSearchBar: boolean;
  public sortByValue = 'staffNameAsc';
  public paginatedWorkers: Worker[];
  private searchTerm = '';
  public searchResults: Worker[];

  public selectedWorkers: string[] = [];

  constructor(
    public backLinkService: BackLinkService,
    public trainingService: TrainingService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
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
    this.getWorkers();
    this.showSearchBar = this.totalWorkerCount > this.itemsPerPage;
    this.setupForm();
    this.prefill();
    // this.setupFormErrorsMap();
    this.setReturnLink();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get selectStaff(): FormArray {
    return this.form.get('selectStaff') as FormArray;
  }

  private prefill(): void {
    this.selectedWorkers = this.trainingService.selectedStaff;
  }

  private setupForm = () => {
    const workerFormArray = this.workers.map((worker) => {
      const checked = this.trainingService.selectedStaff?.includes(worker.uid) ? true : false;

      return this.formBuilder.control({
        name: worker.nameOrId,
        workerUid: worker.uid,
        checked,
      });
    });

    this.form = this.formBuilder.group(
      {
        selectStaff: this.formBuilder.array(workerFormArray),
      },
      {
        validator: this.oneCheckboxRequired,
        updateOn: 'submit',
      },
    );

    this.updateSelectAllCheckbox();
  };

  // public getPageOfWorkers(): void {
  //   this.workerService
  //     .getAllWorkers(this.workplaceUid, {
  //       pageIndex: this.currentPageIndex,
  //       itemsPerPage: this.itemsPerPage,
  //       sortByValue: this.sortByValue,
  //       ...(this.searchTerm ? { searchTerm: this.searchTerm } : {}),
  //     })
  //     .pipe(take(1))
  //     .subscribe(({ workers }) => {
  //       console.log(workers);
  //       this.paginatedWorkers = workers;
  //     });
  // }

  private getWorkers(searchTerm?): void {
    this.workerService
      .getAllWorkers(this.workplaceUid, {
        pageIndex: this.currentPageIndex,
        itemsPerPage: this.itemsPerPage,
        sortByValue: this.sortByValue,
        ...(searchTerm ? { searchTerm } : {}),
      })
      .pipe(take(1))
      .subscribe(({ workers }) => {
        searchTerm ? (this.searchResults = workers) : (this.paginatedWorkers = workers);
      });
  }

  public handlePageUpdate(pageIndex: number): void {
    this.currentPageIndex = pageIndex;

    this.getWorkers();
  }

  private oneCheckboxRequired(form: FormGroup): void {
    if (form?.value?.selectStaff?.every((staff) => staff.checked === false)) {
      form.controls.selectStaff.setErrors({
        oneCheckboxRequired: true,
      });
    } else {
      form.controls.selectStaff.setErrors(null);
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectStaff',
        type: [
          {
            name: 'oneCheckboxRequired',
            message: 'Select the staff who have completed the training',
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

  // public selectAllWorkers(isChecked: boolean): void {
  //   this.selectStaff.controls.forEach((control) => {
  //     return (control.value.checked = isChecked);
  //   });
  // }

  public selectAllWorkers(event: Event): void {
    event.preventDefault();
    if (this.selectAll) {
      this.selectAll = false;
      this.selectedWorkers = [];
    } else {
      this.selectAll = true;
      this.selectedWorkers = this.workers.map((worker) => worker.uid);
    }
  }
  // public selectWorker(control) {
  //   control.value.checked = !control.value.checked;
  //   this.updateSelectAllCheckbox();
  // }

  public selectWorker(event: Event, workerId: string): void {
    event.preventDefault();
    if (this.selectedWorkers.includes(workerId)) {
      const index = this.selectedWorkers.indexOf(workerId);
      this.selectedWorkers.splice(index, 1);
      this.selectAll = false;
    } else {
      this.selectedWorkers.push(workerId);
    }
  }

  // public updateSelectAllCheckbox(): void {
  //   const allWorkersSelected = this.selectStaff.controls.every((control) => control.value.checked === true);
  //   this.selectAll = allWorkersSelected ? true : false;
  // }

  public updateSelectAllCheckbox(): void {
    this.selectAll = this.selectedWorkers?.length === this.workers.length;
  }

  private updateSelectedStaff(): void {
    // const selectedStaff = this.selectStaff.controls
    //   .filter((control) => control.value.checked)
    //   .map((control) => {
    //     return control.value.workerUid;
    //   });

    this.trainingService.updateSelectedStaff(this.selectedWorkers);
  }

  public onSubmit(): void {
    this.oneCheckboxRequired(this.form);
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    // if (this.form.valid) {
    this.updateSelectedStaff();
    this.trainingService.addMultipleTrainingInProgress$.next(true);
    this.router.navigate(['workplace', this.workplaceUid, 'add-multiple-training', 'training-details']);
    // } else {
    //   this.errorSummaryService.scrollToErrorSummary();
    // }
  }

  handleSearch(searchTerm: string): void {
    const prevPageIndex = this.currentPageIndex;
    this.currentPageIndex = 0;
    this.searchTerm = searchTerm;
    this.addQueryParams();
    this.getWorkers(searchTerm);
    this.currentPageIndex = prevPageIndex;
  }

  private addQueryParams(): void {
    this.router.navigate([], {
      queryParams: { search: this.searchTerm },
      queryParamsHandling: 'merge',
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onCancel(): void {
    this.trainingService.resetSelectedStaff();
    this.router.navigate(this.returnLink, { fragment: 'training-and-qualifications' });
  }

  public handleResetSearch(event: Event): void {
    event.preventDefault();
    this.searchInput.handleResetSearch();
    this.searchResults = undefined;
  }
}
