import lodash from 'lodash';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
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
} from '@core/model/pagination.model';
import { WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { AutoSuggestDataProvider } from '@shared/auto-suggest.model';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import {
  ANNUAL_SALARY_PATTERN,
  AnnualSalaryLimits,
  AnnualSalaryLimitsForSeniorManagement,
  HOURLY_PAY_PATTERN,
  HourlyPayRateLimits,
} from '@core/constants/constants';

const radioButtonLabels = [
  { label: 'Hourly', value: 'Hourly', slug: 'hourly' },
  { label: 'Salary', value: 'Annually', slug: 'annually' },
  { label: 'Not known', value: "Don't know", slug: 'dont-know' },
];
const DontKnow = "Don't know";

enum ErrorTypes {
  radioButtonNotSelected = 'radioButtonNotSelected',
  hourlyRateInvalid = 'hourlyRateInvalid',
  annualSalaryInvalid = 'annualSalaryInvalid',
  annualSalaryInvalidSeniorManagement = 'annualSalaryInvalidSeniorManagement',
  hourlyRateMissing = 'hourlyRateMissing',
  annualSalaryMissing = 'annualSalaryMissing',
  hourlyRateDecimalPlace = 'hourlyRateDecimalPlace',
  annualSalaryDecimalPlace = 'annualSalaryDecimalPlace',
}

const ErrorMessages: Record<string, string> = {
  [ErrorTypes.radioButtonNotSelected]: 'Select hourly or salary for the amount entered',
  [ErrorTypes.hourlyRateInvalid]: `Hourly pay rate must be between ${HourlyPayRateLimits.asString.min} and ${HourlyPayRateLimits.asString.max}`,
  [ErrorTypes.annualSalaryInvalid]: `Salary must be between ${AnnualSalaryLimits.asString.min} and ${AnnualSalaryLimits.asString.max}`,
  [ErrorTypes.annualSalaryInvalidSeniorManagement]: `Salary must be between ${AnnualSalaryLimitsForSeniorManagement.asString.min} and ${AnnualSalaryLimitsForSeniorManagement.asString.max}`,
  [ErrorTypes.hourlyRateMissing]: 'Enter the hourly pay rate or select a different option',
  [ErrorTypes.annualSalaryMissing]: 'Enter the salary or select a different option',
  [ErrorTypes.hourlyRateDecimalPlace]: 'You can only have 1 or 2 digits for pence after the decimal point',
  [ErrorTypes.annualSalaryDecimalPlace]: 'Salary must not include pence',
};

@Component({
  selector: 'app-update-pay-for-multiple-staff',
  templateUrl: './update-pay-for-multiple-staff.component.html',
  styleUrl: './update-pay-for-multiple-staff.component.scss',
  standalone: false,
})
export class UpdatePayForMultipleStaffComponent {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public workplace: Establishment;
  public totalWorkerCount: number;
  public currentWorkerCount: number;
  public workersToShow: WorkerWithPayData[];
  public workerUpdated: WorkerWithPayData[];
  public radioButtonLabels = radioButtonLabels;
  public sortByParamMap = StaffSummarySortByParamMap;
  public sortOptions = SortStaffOptionsForUpdatePay;
  public workplaceUid: string;
  public allJobs: Array<Job>;
  public jobRoleDataProvider: WritableSignal<AutoSuggestDataProvider> = signal(null);
  public showNewPillForFastTrackLink: boolean = true;

  public showErrors = false;

  private subscriptions: Subscription = new Subscription();

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
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.group({}),
    });
  }

  get workersFormGroup(): FormGroup {
    return this.form.get('workers') as FormGroup;
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
    const payValue = this.formBuilder.control(worker.annualHourlyPay?.value);
    const payRate = this.formBuilder.control(worker.annualHourlyPay?.rate);
    const workerFormControls = this.formBuilder.group({ payValue, payRate });

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

    workerFormControls.setValidators(this.buildValidators(worker));

    this.subscriptions.add(clearPayRateWhenSelectNotKnown);
    this.subscriptions.add(clearNotKnownRadioButtonWhenTypeInPayRate);

    return workerFormControls;
  }

  private buildValidators(worker: WorkerWithPayData): ValidatorFn[] {
    const hourlyRateInvalidValidator = CustomValidators.buildCompositeValidator(
      [
        Validators.min(HourlyPayRateLimits.min),
        Validators.max(HourlyPayRateLimits.max),
        Validators.pattern(HOURLY_PAY_PATTERN),
      ],
      ErrorTypes.hourlyRateInvalid,
    );
    const hourlyRateMissingValidator = CustomValidators.buildCompositeValidator(
      [Validators.required],
      ErrorTypes.hourlyRateMissing,
    );

    const hourlyRateValidator = CustomValidators.buildCompositeValidator([
      hourlyRateInvalidValidator,
      hourlyRateMissingValidator,
    ]);

    const annualSalaryInvalidValidator = CustomValidators.buildCompositeValidator(
      [
        Validators.min(AnnualSalaryLimits.min),
        Validators.max(AnnualSalaryLimits.max),
        Validators.pattern(ANNUAL_SALARY_PATTERN),
      ],
      ErrorTypes.annualSalaryInvalid,
    );
    const annualSalaryMissingValidator = CustomValidators.buildCompositeValidator(
      [Validators.required],
      ErrorTypes.annualSalaryMissing,
    );
    const annualSalaryValidator = CustomValidators.buildCompositeValidator([
      annualSalaryInvalidValidator,
      annualSalaryMissingValidator,
    ]);

    const crossFieldValidator = (workerFormControls: FormGroup) => {
      const { payRate, payValue } = workerFormControls.value ?? {};
      const payRateControl = workerFormControls.get('payRate')!;
      const payValueControl = workerFormControls.get('payValue')!;

      if (!payValue && payRate) {
        payValueControl.setErrors({ radioButtonNotSelected: true });
        return null;
      }

      switch (payValue) {
        case 'Hourly': {
          const errorFound = hourlyRateValidator(payRateControl);
          if (errorFound) {
            payRateControl.setErrors(errorFound);
          }
          break;
        }
        case 'Annually': {
          const errorFound = annualSalaryValidator(payRateControl);
          if (errorFound) {
            payRateControl.setErrors(errorFound);
          }
          break;
        }
      }
    };

    // @ts-ignore
    return [crossFieldValidator];
  }

  private setupFormErrorsMap(): void {
    const errorMapForWorkers = this.workersToShow.flatMap((worker) => this.buildErrorMapForWorker(worker));
    this.formErrorsMap = errorMapForWorkers;
  }

  private buildErrorMapForWorker(worker: WorkerWithPayData): ErrorDetails[] {
    const payRateErrors = ['hourlyRateInvalid', 'annualSalaryInvalid', 'hourlyRateMissing', 'annualSalaryMissing'];

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

  private getErrorMessage(errorType: string, workerNameOrId?: string): string {
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

    const errorType = Object.keys(errors)[0];
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

  public getPageOfWorkers(searchEvent: SearchEvent): void {
    const searchParams = this.convertJobRoleNameToId(parseSearchEvent(searchEvent));

    const getWorker = this.workerService
      .getWorkersWithPayData(this.workplaceUid, searchParams)
      .pipe(take(1))
      .subscribe((response) => {
        this.setNewWorkers(response.workers);
        this.currentWorkerCount = response.count;
      });

    this.subscriptions.add(getWorker);
  }

  private setNewWorkers(workers: WorkerWithPayData[]) {
    this.workersToShow = workers;
    this.addWorkersToForm(workers);
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
    const touchedFormControls = Object.entries(this.workersFormGroup.controls).filter(([_workerUid, control]) => {
      return control.dirty;
    });
    const updates = touchedFormControls.map(([formControlKey, control]) => {
      const { payValue, payRate } = control.value;
      const workerUid = formControlKey.replace('uid-', '');
      return { uid: workerUid, annualHourlyPay: { value: payValue, rate: payRate } };
    });

    return updates;
  }

  public onSubmit(): void {
    this.showErrors = true;
    if (this.form.invalid) {
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
