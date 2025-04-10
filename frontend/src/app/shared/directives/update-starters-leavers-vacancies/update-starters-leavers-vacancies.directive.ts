import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { jobOptionsEnum, StarterLeaverVacancy, UpdateJobsRequest } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  UpdateWorkplaceAfterStaffChangesService,
  WorkplaceUpdatePage,
} from '@core/services/update-workplace-after-staff-changes.service';
import { FormatUtil } from '@core/utils/format-util';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import lodash from 'lodash';

@Directive()
export class UpdateStartersLeaversVacanciesDirective implements OnInit, AfterViewInit {
  @ViewChildren('numberInputRef') numberInputs: QueryList<NumberInputWithButtonsComponent>;
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;
  public serverError = null;

  public questionPreviouslyAnswered: boolean = false;
  public selectedJobRoles: Array<StarterLeaverVacancy> = [];
  public selectedNoOrDoNotKnow: jobOptionsEnum = null;
  public totalNumber: number = 0;

  public minNumberPerJobRole = 1;
  public maxNumberPerJobRole = 999;

  public heading: string;
  public addJobRoleButtonText: string;
  public tableTitle: string;
  public totalNumberDescription: string;
  public revealText: string;
  public reminderText: string;
  public radioButtonOptions: { label: string; value: jobOptionsEnum }[];
  public messageWhenNoJobRoleSelected: { None: string; DoNotKnow: string; Default: string };

  public serverErrorMessage: string;
  public noOrDoNotKnowErrorMessage: string;
  public numberRequiredErrorMessage: string;
  public validNumberErrorMessage: string;

  protected slvField: string;
  protected selectedField: string;
  protected updatePage: WorkplaceUpdatePage;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.setupForm();
    this.prefill();
    this.setupFormErrorsMap();
    this.setupTexts();
    this.setBackLink();
    this.updateWorkplaceAfterStaffChangesService.addToVisitedPages(this.updatePage);
  }

  ngAfterViewInit() {
    this.updateTotalNumber();

    this.numberInputs.forEach((input) => input.registerOnChange(() => this.updateTotalNumber()));
    this.numberInputs.changes.subscribe(() => {
      this.setupFormErrorsMap(); // rebuild form errors map as job role index changed
      this.updateTotalNumber();
    });

    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setupTexts(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        jobRoleNumbers: this.formBuilder.array([], { updateOn: 'submit', validators: [] }),
        noOrDoNotKnow: this.formBuilder.control(null, { updateOn: 'submit', validators: [] }),
      },
      {
        validators: [CustomValidators.crossCheckJobRoleOptions()],
        updateOn: 'submit',
      },
    );
  }

  private prefill(): void {
    const dataFromJobRoleSelectionPage = this.updateWorkplaceAfterStaffChangesService[this.selectedField];
    const dataFromDatabase = this.establishmentService.establishment?.[this.slvField];

    const dataToPrefillFrom = dataFromJobRoleSelectionPage === null ? dataFromDatabase : dataFromJobRoleSelectionPage;

    this.prefillFromData(dataToPrefillFrom);
    this.selectedJobRoles.forEach((jobRole) => this.createJobRoleFormControl(jobRole));

    this.questionPreviouslyAnswered = dataFromDatabase !== null;
  }

  private prefillFromData(data: string | StarterLeaverVacancy[]): void {
    if (Array.isArray(data)) {
      this.selectedJobRoles = data;
      return;
    }

    if ([jobOptionsEnum.NONE, jobOptionsEnum.DONT_KNOW].includes(data as jobOptionsEnum)) {
      this.selectedNoOrDoNotKnow = data as jobOptionsEnum;
      this.form.patchValue({ noOrDoNotKnow: data });
    }
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  private createJobRoleFormControl = (jobRole: StarterLeaverVacancy): void => {
    const initialValue = jobRole.total ?? '';
    this.jobRoleNumbers.push(
      this.formBuilder.control(initialValue, {
        validators: [
          Validators.required,
          Validators.min(this.minNumberPerJobRole),
          Validators.max(this.maxNumberPerJobRole),
          Validators.pattern('^[0-9]+$'),
        ],
        updateOn: 'submit',
      }),
    );
  };

  protected setupFormErrorsMap(): void {
    const errorMapForJobRoles = this.selectedJobRoles.map((jobRole, index) =>
      this.buildErrorMapForJobRole(jobRole, index),
    );
    const otherErrorMap = [
      {
        item: 'jobRoleNumbers',
        type: [
          {
            name: 'required',
            message: 'Add a job role',
          },
        ],
      },
      {
        item: 'noOrDoNotKnow',
        type: [
          {
            name: 'required',
            message: this.noOrDoNotKnowErrorMessage,
          },
        ],
      },
    ];

    this.formErrorsMap = [...errorMapForJobRoles, ...otherErrorMap];
  }

  private buildErrorMapForJobRole(jobRole: StarterLeaverVacancy, index: number): ErrorDetails {
    const errorTypes = ['required', 'min', 'max', 'pattern'];

    const errorMap = {
      item: `jobRoleNumbers.${index}`,
      type: errorTypes.map((errorType) => ({
        name: errorType,
        message: this.getErrorMessageForJobRole(jobRole, errorType),
      })),
    };

    return errorMap;
  }

  protected getErrorMessageForJobRole(
    jobRole: StarterLeaverVacancy,
    errorType: string,
    inline: boolean = false,
  ): string {
    const jobRoleTitleInLowerCase = jobRole.title.toLowerCase();

    switch (errorType) {
      case 'required': {
        return `${this.numberRequiredErrorMessage} ${jobRoleTitleInLowerCase}`;
      }
      case 'min':
      case 'max':
      case 'pattern': {
        if (inline) {
          return this.validNumberErrorMessage;
        }
        return `${this.validNumberErrorMessage} (${jobRoleTitleInLowerCase})`;
      }
    }
  }

  public getInlineErrorMessageForJobRole(jobRoleWithError: StarterLeaverVacancy, index: number): string {
    const errorType = Object.keys(this.jobRoleNumbers.at(index).errors)[0];
    return this.getErrorMessageForJobRole(jobRoleWithError, errorType, true);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backlinkService.showBackLink();
  }

  public removeJobRole = (jobRoleIndex: number): void => {
    if (jobRoleIndex < 0 || jobRoleIndex >= this.selectedJobRoles.length) {
      return;
    }

    this.selectedJobRoles = this.selectedJobRoles.filter((_, index) => index !== jobRoleIndex);
    this.jobRoleNumbers.removeAt(jobRoleIndex);
  };

  public removeAllSelectedJobRoles = (): void => {
    this.selectedJobRoles = [];
    this.jobRoleNumbers.clear();
  };

  private syncSelectedJobRolesNumberWithForm = (): void => {
    this.numberInputs.forEach((numberInput, index) => {
      const currentNumber = isNaN(numberInput.currentNumber) ? 0 : numberInput.currentNumber;
      this.selectedJobRoles[index].total = currentNumber;
    });
  };

  public handleAddJobRole = (): void => {
    this.syncSelectedJobRolesNumberWithForm();
    this.updateWorkplaceAfterStaffChangesService[this.selectedField] = this.selectedJobRoles;

    this.router.navigate([`../update-${this.slvField}-job-roles`], { relativeTo: this.route });
  };

  public handleClickedNoOrDoNotKnow = (value: jobOptionsEnum): void => {
    this.selectedNoOrDoNotKnow = value;
    this.form.patchValue({ noOrDoNotKnow: value });
    this.removeAllSelectedJobRoles();
  };

  private updateTotalNumber(): void {
    const allJobRoleNumbers =
      this.numberInputs?.map((input) => input.currentNumber).filter((number) => !isNaN(number)) ?? [];
    this.totalNumber = lodash.sum(allJobRoleNumbers);
    this.cd.detectChanges();
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    if (this.selectedNoOrDoNotKnow) {
      return { [this.slvField]: this.form.get('noOrDoNotKnow').value };
    }

    const updatedField = this.selectedJobRoles.map((job, index) => {
      return {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
    });

    return { [this.slvField]: updatedField };
  }

  public onSubmit(): void {
    this.submitted = true;

    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const establishmentUid = this.establishmentService.establishment.uid;
    const updateProps = this.generateUpdateProps();

    this.establishmentService.updateJobs(establishmentUid, updateProps).subscribe(
      () => {
        this.onSuccess();
      },
      (error) => {
        this.onError(error);
      },
    );
  }

  private onSuccess(): void {
    this.updateWorkplaceAfterStaffChangesService.clearAllSelectedJobRoles();
    this.updateWorkplaceAfterStaffChangesService.addToSubmittedPages(this.updatePage);

    this.returnToPreviousPage();
  }

  private onError(_error: Error): void {
    this.form.setErrors({ serverError: true });
    this.serverError = this.serverErrorMessage;
  }

  private returnToPreviousPage(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.updateWorkplaceAfterStaffChangesService.clearAllSelectedJobRoles();
    this.returnToPreviousPage();
  }

  protected getDateForOneYearAgo(): string {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 1);

    return FormatUtil.formatDateToLocaleDateString(today);
  }
}
