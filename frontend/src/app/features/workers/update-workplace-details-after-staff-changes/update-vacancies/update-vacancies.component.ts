import lodash from 'lodash';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { jobOptionsEnum, UpdateJobsRequest, Vacancy } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { NumberInputWithButtonsComponent } from '@shared/components/number-input-with-buttons/number-input-with-buttons.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-update-vacancies',
  templateUrl: './update-vacancies.component.html',
  styleUrl: './update-vacancies.component.scss',
})
export class UpdateVacanciesComponent implements OnInit, AfterViewInit {
  @ViewChildren('numberInputRef') numberInputs: QueryList<NumberInputWithButtonsComponent>;
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;

  public isAFreshWorkplace: boolean = false;
  public selectedJobRoles: Array<Vacancy> = [];
  public selectedNoOrDoNotKnow: jobOptionsEnum = null;
  public totalNumber: number = 0;

  public minNumberPerJobRole = 1;
  public maxNumberPerJobRole = 999;

  public heading: string;
  public addJobRoleButtonText: string;
  public jobRoleTitle = 'Current staff vacancies';
  public totalNumberDescription = 'Total number of vacancies';
  public revealText =
    'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
  public reminderText = `Remember to <strong>SUBTRACT</strong> or <strong>REMOVE</strong> any that are <strong>no longer vacancies</strong>.`;
  public radioButtonOptions = [
    {
      label: 'There are no current staff vacancies',
      value: jobOptionsEnum.NONE,
    },
    {
      label: 'I do not know if there are any current staff vacancies',
      value: jobOptionsEnum.DONT_KNOW,
    },
  ];
  public messageWhenNoJobRoleSelected = {
    None: 'There are no current staff vacancies.',
    DoNotKnow: 'You do not know if there are any current staff vacancies.',
    Default: "You've not added any current staff vacancies.",
  };

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

  protected setupTexts(): void {
    if (this.isAFreshWorkplace) {
      this.heading = 'Add your current staff vacancies';
      this.addJobRoleButtonText = 'Add job roles';
    } else {
      this.heading = 'Update your current staff vacancies';
      this.addJobRoleButtonText = 'Add more job roles';
    }
  }

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
    const dataFromJobRoleSelectionPage = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;
    const dataFromDatabase = this.establishmentService.establishment.vacancies;

    const dataToPrefillFrom = dataFromJobRoleSelectionPage === null ? dataFromDatabase : dataFromJobRoleSelectionPage;

    this.prefillFromData(dataToPrefillFrom);
    this.selectedJobRoles.forEach((jobRole) => this.createJobRoleFormControl(jobRole));

    this.isAFreshWorkplace = dataFromDatabase === null;
  }

  private prefillFromData(data: string | Vacancy[]): void {
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

  private createJobRoleFormControl = (jobRole: Vacancy): void => {
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
            message: 'Select there are no current staff vacancies or do not know',
          },
        ],
      },
    ];

    this.formErrorsMap = [...errorMapForJobRoles, ...otherErrorMap];
  }

  private buildErrorMapForJobRole(jobRole: Vacancy, index: number): ErrorDetails {
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

  protected getErrorMessageForJobRole(jobRole: Vacancy, errorType: string, inline: boolean = false): string {
    const jobRoleTitleInLowerCase = jobRole.title.toLowerCase();

    switch (errorType) {
      case 'required': {
        return `Enter the number of current staff vacancies or remove ${jobRoleTitleInLowerCase}`;
      }
      case 'min':
      case 'max':
      case 'pattern': {
        if (inline) {
          return `Number of vacancies must be between 1 and 999`;
        }
        return `Number of vacancies must be between 1 and 999 (${jobRoleTitleInLowerCase})`;
      }
    }
  }

  public getInlineErrorMessageForJobRole(jobRoleWithError: Vacancy, index: number): string {
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
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = this.selectedJobRoles;

    this.router.navigate(['../update-vacancies-job-roles'], { relativeTo: this.route });
  };

  public handleClickedNoOrDoNotKnow = (value: jobOptionsEnum): void => {
    this.selectedNoOrDoNotKnow = value;
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
      return { vacancies: this.form.get('noOrDoNotKnow').value };
    }

    const updatedVacancies = this.selectedJobRoles.map((job, index) => {
      const fieldsToUpdate: Vacancy = {
        jobId: Number(job.jobId),
        total: parseInt(this.jobRoleNumbers.value[index]),
      };
      return fieldsToUpdate;
    });

    return { vacancies: updatedVacancies };
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
    this.returnToPreviousPage();
  }

  private onError(error: Error): void {
    console.log(error);
  }

  private returnToPreviousPage(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.updateWorkplaceAfterStaffChangesService.clearAllSelectedJobRoles();
    this.returnToPreviousPage();
  }
}
