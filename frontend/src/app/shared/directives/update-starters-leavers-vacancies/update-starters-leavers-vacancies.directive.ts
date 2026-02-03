import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { jobOptionsEnum, StarterLeaverVacancy, UpdateJobsRequest } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { DateUtil } from '@core/utils/date-util';
import { FormatUtil } from '@core/utils/format-util';
import { JobRoleNumbersTableComponent } from '@shared/components/job-role-numbers-table/job-role-numbers-table.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Directive()
export class UpdateStartersLeaversVacanciesDirective implements OnInit, AfterViewInit {
  @ViewChild('jobRoleNumbersTable') jobRoleNumbersTable: JobRoleNumbersTableComponent;
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
  public currentMessageWhenNoJobRoleSelected: string;
  public addExplanationMessage: string;

  public serverErrorMessage: string;
  public noOrDoNotKnowErrorMessage: string;
  public numberRequiredErrorMessage: string;
  public validNumberErrorMessage: string;
  public jobRoleErrorMessages: Record<number, string> = {};

  protected slvField: string;
  protected updateJobRolePage: string;
  protected selectedField: string;
  protected updatePage: WorkplaceUpdatePage;
  protected returnInEstablishmentService: URLStructure;
  protected staffUpdatesView: boolean;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.staffUpdatesView = this.route.snapshot?.data?.staffUpdatesView;
    this.returnInEstablishmentService = this.establishmentService.returnTo;

    this.setupForm();
    this.prefill();
    this.setupFormErrorsMap();
    this.setupTexts();
    this.updateNoJobRoleSelectedMessage();
    this.setBackLink();
    this.vacanciesAndTurnoverService.addToVisitedPages(this.updatePage);
  }

  ngAfterViewInit() {
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
    const dataFromJobRoleSelectionPage = this.vacanciesAndTurnoverService[this.selectedField];
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

  public updateNoJobRoleSelectedMessage() {
    switch (this.selectedNoOrDoNotKnow) {
      case jobOptionsEnum.NONE: {
        this.currentMessageWhenNoJobRoleSelected = this.messageWhenNoJobRoleSelected.None;
        break;
      }
      case jobOptionsEnum.DONT_KNOW: {
        this.currentMessageWhenNoJobRoleSelected = this.messageWhenNoJobRoleSelected.DoNotKnow;
        break;
      }
      default: {
        this.currentMessageWhenNoJobRoleSelected = this.messageWhenNoJobRoleSelected.Default;
      }
    }
  }

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
    const jobRoleTitleInLowerCase = FormatUtil.formatToLowercaseExcludingAcronyms(jobRole.title);

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

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backlinkService.showBackLink();
  }

  public handleRemoveJobRole(jobRoleIndex: number): void {
    this.removeJobRole(jobRoleIndex);
    this.setupFormErrorsMap(); // rebuild form errors map as job role index changed
    this.updateJobRoleErrorMessages();

    this.cd.detectChanges();
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

  public handleAddJobRole = (): void => {
    this.vacanciesAndTurnoverService[this.selectedField] = this.jobRoleNumbersTable.currentValues;

    this.router.navigate([`../${this.updateJobRolePage}`], { relativeTo: this.route });
  };

  public handleClickedNoOrDoNotKnow = (value: jobOptionsEnum): void => {
    this.selectedNoOrDoNotKnow = value;
    this.updateNoJobRoleSelectedMessage();
    this.form.patchValue({ noOrDoNotKnow: value });
    this.removeAllSelectedJobRoles();
  };

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

    this.updateJobRoleErrorMessages();

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

  private updateJobRoleErrorMessages(): void {
    const jobRoleErrorMessages = {};

    this.selectedJobRoles.forEach((job, index) => {
      const errors = this.jobRoleNumbers.at(index).errors;
      if (!errors) {
        return;
      }
      const errorType = Object.keys(errors)[0];
      jobRoleErrorMessages[job.jobId] = this.getErrorMessageForJobRole(job, errorType, true);
    });

    this.jobRoleErrorMessages = jobRoleErrorMessages;
  }

  private onSuccess(): void {
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
    this.vacanciesAndTurnoverService.addToSubmittedPages(this.updatePage);

    this.returnToPreviousPage();
  }

  private onError(_error: Error): void {
    this.form.setErrors({ serverError: true });
    this.serverError = this.serverErrorMessage;
  }

  private returnToPreviousPage(): void {
    if (this.staffUpdatesView) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else if (this.returnInEstablishmentService) {
      this.router.navigate(this.returnInEstablishmentService.url, {
        fragment: this.returnInEstablishmentService.fragment,
      });
    } else {
      this.router.navigate(['/dashboard'], { fragment: 'workplace' });
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
    this.returnToPreviousPage();
  }

  protected getDateForOneYearAgo(): string {
    return DateUtil.getDateForOneYearAgo();
  }
}
