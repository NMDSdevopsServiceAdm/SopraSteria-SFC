import lodash from 'lodash';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import {
  Establishment,
  SortStaffOptionsForUpdatePay,
  StaffSummarySortByParamMap,
} from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import {
  parseSearchEvent,
  QueryParamsForBackend,
  QueryParamsForWorkerWithPayData,
  SearchEvent,
  SearchParams,
} from '@core/model/pagination.model';
import { WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { AutoSuggestDataProvider } from '@shared/auto-suggest.model';
import { SearchInputAutoSuggestComponent } from '@shared/components/search-input-auto-suggest/search-input-auto-suggest.component';
import { TablePaginationWrapperComponent } from '@shared/components/table-pagination-wrapper/table-pagination-wrapper.component';
import {
  buildValidatorsForUpdatePayForMultipleWorkers,
  UpdatePayForMultipleWorkerErrorMessages as ErrorMessages,
  UpdatePayForMultipleWorkerErrorTypes as ErrorTypes,
} from '@shared/validators/worker-pay-validators';

const radioButtonLabels = [
  { label: 'Hourly', value: 'Hourly', slug: 'hourly' },
  { label: 'Salary', value: 'Annually', slug: 'annually' },
  { label: 'Not known', value: "Don't know", slug: 'dont-know' },
];
const DontKnow = "Don't know";

@Component({
  selector: 'app-update-pay-for-multiple-staff',
  templateUrl: './update-pay-for-multiple-staff.component.html',
  styleUrl: './update-pay-for-multiple-staff.component.scss',
  standalone: false,
})
export class UpdatePayForMultipleStaffComponent {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('paginationWrapper') paginationWrapper: TablePaginationWrapperComponent;
  @ViewChild('searchBox') searchBox: SearchInputAutoSuggestComponent;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public workplace: Establishment;
  public totalWorkerCount: number;
  public currentWorkerCount: number;
  public workersToShow: WorkerWithPayData[];
  public radioButtonLabels = radioButtonLabels;
  public sortByParamMap = StaffSummarySortByParamMap;
  public sortOptions = SortStaffOptionsForUpdatePay;
  public workplaceUid: string;
  public allJobs: Array<Job>;
  public jobRoleDataProvider = signal<AutoSuggestDataProvider>(null);
  public showNewPillForFastTrackLink: boolean = true;
  public showErrors = false;

  private subscriptions: Subscription = new Subscription();
  private paginationState: SearchParams;
  private validationIsActive = signal(false);
  private payRateValidator: ValidatorFn;
  private payValueValidator: ValidatorFn;

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.establishment;
    this.workplaceUid = this.workplace.uid;
    this.showNewPillForFastTrackLink = !this.workplace.fastTrackPayByJobRolesViewed;
    this.buildValidators();

    const totalWorkerCount = this.route.snapshot.data.workersWithPayData?.count;
    this.currentWorkerCount = totalWorkerCount;
    this.totalWorkerCount = totalWorkerCount;

    this.allJobs = this.route.snapshot.data.mainJobRoles;
    this.buildJobDataProvider();

    const firstPageWorkers = this.route.snapshot.data.workersWithPayData?.workers ?? [];
    this.workersToShow = firstPageWorkers;
    this.setupForm();
    this.addWorkersToForm(this.workersToShow);
    this.setupFormErrorsMap();

    this.backLinkService.showBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
    this.storePaginationState();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.group({}),
    });
  }

  get workersFormGroup(): FormGroup {
    return this.form.get('workers') as FormGroup;
  }

  private buildValidators(): void {
    const { payRateValidator, payValueValidator } = buildValidatorsForUpdatePayForMultipleWorkers(
      this.validationIsActive,
    );
    this.payRateValidator = payRateValidator;
    this.payValueValidator = payValueValidator;
  }

  private addWorkersToForm(workers: WorkerWithPayData[]): void {
    const workersInForm = Object.keys(this.workersFormGroup.controls);

    workers
      .filter((worker) => !workersInForm.includes(`uid-${worker.uid}`))
      .forEach((worker) => {
        this.workersFormGroup.addControl(`uid-${worker.uid}`, this.buildFormControlsForWorker(worker));
      });
  }

  private buildFormControlsForWorker(worker: WorkerWithPayData): FormGroup {
    const payValue = this.formBuilder.control<string>(worker.annualHourlyPay?.value);
    const payRate = this.formBuilder.control<number>(worker.annualHourlyPay?.rate);
    const workerFormControls = this.formBuilder.group({ payValue, payRate, jobId: worker.mainJob.id, uid: worker.uid });

    const clearPayRateWhenSelectNotKnown = payValue.valueChanges
      .pipe(filter((newValue) => newValue === DontKnow))
      .subscribe(() => {
        payRate.setValue(null, { emitEvent: false });
      });

    const clearNotKnownRadioButtonWhenTypeInPayRate = payRate.valueChanges
      .pipe(
        filter((newValue) => !!newValue),
        filter(() => payValue.value === DontKnow),
      )
      .subscribe(() => {
        payValue.setValue(null, { emitEvent: false });
      });

    payValue.setValidators([this.payValueValidator]);
    payRate.setValidators([this.payRateValidator]);

    this.subscriptions.add(clearPayRateWhenSelectNotKnown);
    this.subscriptions.add(clearNotKnownRadioButtonWhenTypeInPayRate);

    return workerFormControls;
  }

  private setupFormErrorsMap(): void {
    const errorMapForWorkers = this.workersToShow.flatMap((worker) => this.buildErrorMapForWorker(worker));
    this.formErrorsMap = errorMapForWorkers;
  }

  private buildErrorMapForWorker(worker: WorkerWithPayData): ErrorDetails[] {
    const payRateErrors = lodash.without(Object.values(ErrorTypes), ErrorTypes.radioButtonNotSelected);

    const errorMap = [
      {
        item: `uid-${worker.uid}.payValue`,
        type: [
          {
            name: ErrorTypes.radioButtonNotSelected,
            message: this.getErrorMessage(ErrorTypes.radioButtonNotSelected, worker.nameOrId),
          },
        ],
      },
      {
        item: `uid-${worker.uid}.payRate`,
        type: payRateErrors.map((errorType) => {
          return { name: errorType, message: this.getErrorMessage(errorType, worker.nameOrId) };
        }),
      },
    ];

    return errorMap;
  }

  private getErrorMessage(errorType: ErrorTypes, workerNameOrId?: string): string {
    const errorMessage = ErrorMessages[errorType];
    if (workerNameOrId) {
      return `${errorMessage} (${workerNameOrId})`;
    }
    return errorMessage;
  }

  public getInlineErrorMessage(worker: WorkerWithPayData): string {
    const formControl = this.workersFormGroup.get(`uid-${worker.uid}`);
    const errors = formControl?.get('payValue')?.errors ?? formControl?.get('payRate')?.errors;
    if (!errors) {
      return '';
    }

    const errorType = Object.keys(errors)[0] as ErrorTypes;
    return this.getErrorMessage(errorType);
  }

  public handleClickForFastTrackPageLink(): void {
    this.router
      .navigate(['../fast-track-pay-updates'], { relativeTo: this.route })
      .then(() => this.setFastTrackPayByJobRolesViewed());
  }

  private setFastTrackPayByJobRolesViewed(): void {
    if (this.workplace.fastTrackPayByJobRolesViewed) {
      return;
    }

    const data = {
      property: 'fastTrackPayByJobRolesViewed',
      value: true,
    };

    this.establishmentService.updateSingleEstablishmentField(this.workplaceUid, data).subscribe(() => {
      this.establishmentService.setState({ ...this.workplace, fastTrackPayByJobRolesViewed: true });
    });
  }

  private convertJobRoleNameToId(queryParams: QueryParamsForBackend): QueryParamsForWorkerWithPayData {
    if (!queryParams.searchTerm) {
      return queryParams;
    }

    const jobRoleTitle = queryParams.searchTerm;
    const matchedJob = this.allJobs.find((job) => job.title === jobRoleTitle);

    if (!matchedJob) {
      return queryParams;
    }

    return {
      ...lodash.omit(queryParams, 'searchTerm'),
      jobId: matchedJob.id,
    };
  }

  private storePaginationState(): void {
    this.paginationState = this.paginationWrapper.currentSearchParams;
  }

  private revertPaginationState(): void {
    this.paginationWrapper.setStateWithoutEmitSearchEvent(this.paginationState);
  }

  public handleSearchEvent(searchEvent: SearchEvent): void {
    const callbackOnSearchResult = searchEvent?.callback;
    this.callValidator();
    this.showErrors = true;

    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.pauseValidator();
      this.showErrors = true;
      this.errorSummaryService.scrollToErrorSummary();

      if (this.paginationState) {
        this.revertPaginationState();
      }

      if (callbackOnSearchResult) {
        callbackOnSearchResult(false);
      }

      return;
    }

    this.showErrors = false;
    this.storePaginationState();

    const searchParams = this.convertJobRoleNameToId(parseSearchEvent(searchEvent));

    const getWorker = this.workerService
      .getWorkersWithPayData(this.workplaceUid, searchParams)
      .pipe(take(1))
      .subscribe((response) => {
        this.setNewWorkers(response.workers);
        this.currentWorkerCount = response.count;
        if (callbackOnSearchResult) {
          callbackOnSearchResult(true);
        }
      });

    this.subscriptions.add(getWorker);
  }

  private setNewWorkers(workers: WorkerWithPayData[]) {
    this.workersToShow = workers;
    this.addWorkersToForm(workers);
    this.setupFormErrorsMap();
  }

  public buildJobDataProvider() {
    const allJobsTitles = this.allJobs.map((job) => job.title);
    const dataProvider: AutoSuggestDataProvider = (searchTerm: string) => {
      if (!searchTerm) {
        return [];
      }

      const searchTermInLowerCase = searchTerm.trim().toLowerCase();

      const suggestedJobs = allJobsTitles.filter((jobTitle) => {
        return jobTitle && jobTitle.toLowerCase().includes(searchTermInLowerCase);
      }) as string[];

      const matchStartComeFirst = (jobTitle: string) =>
        jobTitle && jobTitle.toLowerCase().startsWith(searchTermInLowerCase) ? 1 : 2;

      const suggestionsWithUpdateOrders = lodash.sortBy(suggestedJobs, [matchStartComeFirst, lodash.identity]);

      return suggestionsWithUpdateOrders;
    };

    this.jobRoleDataProvider.set(dataProvider);
  }

  private getUpdatedPayData() {
    const touchedFormControls = Object.values(this.workersFormGroup.controls).filter((control) => {
      return control.dirty;
    });

    const updates = touchedFormControls
      .map((formControl) => formControl.value)
      .filter((formValue) => !!formValue.payValue)
      .map((formValue) => {
        const { payValue, payRate, uid } = formValue;
        return { uid, annualHourlyPay: { value: payValue, rate: payRate } };
      });

    return updates;
  }

  private callValidator(): void {
    this.validationIsActive.set(true);
    this.errorSummaryService.formEl$.next(this.formEl);
    Object.values(this.workersFormGroup.controls).forEach((workerformControl) => {
      workerformControl.get('payRate')!.updateValueAndValidity();
      workerformControl.get('payValue')!.updateValueAndValidity();
    });
  }

  private pauseValidator(): void {
    this.validationIsActive.set(false);
  }

  public onSubmit(): void {
    this.callValidator();
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    this.showErrors = true;

    if (this.form.invalid) {
      this.pauseValidator();
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const updatedPayData = this.getUpdatedPayData();
    if (!updatedPayData?.length) {
      this.returnToStaffRecordsPage();
      return;
    }

    const alertMessage = `Pay updated in ${updatedPayData.length} staff record${updatedPayData.length > 1 ? 's' : ''}`;

    const submitCall = this.establishmentService.updateWorkers(this.workplaceUid, updatedPayData).subscribe(() => {
      this.returnToStaffRecordsPage().then(() => {
        this.alertService.addAlert({ type: 'success', message: alertMessage });
      });
    });

    this.subscriptions.add(submitCall);
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToStaffRecordsPage();
  }

  private returnToStaffRecordsPage(): Promise<boolean> {
    return this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
