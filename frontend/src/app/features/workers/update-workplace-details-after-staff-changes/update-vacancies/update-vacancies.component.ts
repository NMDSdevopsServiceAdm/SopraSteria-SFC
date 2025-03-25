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

  public heading: string;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;
  public selectedJobRoles: Array<Vacancy> = [];
  public selectedNoOrDoNotKnow: jobOptionsEnum = null;
  public totalNumber: number = 0;

  public minNumberPerJobRole = 1;
  public maxNumberPerJobRole = 999;

  public knownOptions = [
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
    None: 'You have no current staff vacancies.',
    DoNotKnow: 'You do not know if there are any current staff vacancies.',
    Default: "You've not added any current staff vacancies. ",
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
    this.setupTexts();
    this.setupForm();

    this.prefill();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.updateTotalNumber();

    this.numberInputs.forEach((input) => input.registerOnChange(() => this.updateTotalNumber()));
    this.numberInputs.changes.subscribe(() => this.updateTotalNumber());

    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupTexts() {
    this.heading = 'Update your current staff vacancies';
  }

  public setupForm() {
    this.form = this.formBuilder.group({
      jobRoleNumbers: this.formBuilder.array([]),
      noOrDoNotKnow: this.formBuilder.control(null, {
        validators: [CustomValidators.validateJobRoleAddedOrUserChoseNoOrDoNotKnow()],
        updateOn: 'submit',
      }),
    });
  }

  public prefill() {
    const vacanciesFromJobRoleSelectionPage = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;

    if (vacanciesFromJobRoleSelectionPage === null) {
      this.prefillFromBackendData();
    } else {
      this.selectedJobRoles = vacanciesFromJobRoleSelectionPage;
    }

    this.selectedJobRoles.forEach((jobRole) => this.createJobRoleFormControl(jobRole));
  }

  private prefillFromBackendData() {
    const vacanciesFromBackend = this.establishmentService.establishment.vacancies;
    if (Array.isArray(vacanciesFromBackend)) {
      this.selectedJobRoles = vacanciesFromBackend;
      return;
    }

    if ([jobOptionsEnum.NONE, jobOptionsEnum.DONT_KNOW].includes(vacanciesFromBackend as jobOptionsEnum)) {
      this.selectedNoOrDoNotKnow = vacanciesFromBackend as jobOptionsEnum;
      this.form.patchValue({ noOrDoNotKnow: vacanciesFromBackend });
    }
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  private createJobRoleFormControl = (jobRole: Vacancy) => {
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

  public setupFormErrorsMap() {
    const errorMapForJobRoles = this.selectedJobRoles.map((jobRole, index) =>
      this.buildErrorMapForJobRole(jobRole, index),
    );
    const errorMapForNoOrDoNotKnow = [
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

    this.formErrorsMap = [...errorMapForJobRoles, ...errorMapForNoOrDoNotKnow];
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

  protected getErrorMessageForJobRole(jobRole: Vacancy, errorType: string) {
    const jobRoleTitleInLowerCase = jobRole.title.toLowerCase();

    switch (errorType) {
      case 'required':
      case 'min': {
        return `Enter the number of current staff vacancies or remove ${jobRoleTitleInLowerCase}`;
      }
      case 'max':
      case 'pattern': {
        return `Number of current staff vacancies must be between 1 and 999 (${jobRoleTitleInLowerCase})`;
      }
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink() {
    this.backlinkService.showBackLink();
  }

  public removeJobRole = (jobRoleIndex: number) => {
    if (jobRoleIndex < 0 || jobRoleIndex >= this.selectedJobRoles.length) {
      return;
    }

    this.selectedJobRoles = this.selectedJobRoles.filter((_, index) => index !== jobRoleIndex);
    this.jobRoleNumbers.removeAt(jobRoleIndex);
  };

  public removeAllSelectedJobRoles = () => {
    this.selectedJobRoles = [];
    this.jobRoleNumbers.clear();
  };

  private syncSelectedJobRolesNumberWithFormInput = () => {
    this.numberInputs.forEach((numberInput, index) => {
      const currentNumber = isNaN(numberInput.currentNumber) ? 0 : numberInput.currentNumber;
      this.selectedJobRoles[index].total = currentNumber;
    });
  };

  public handleAddJobRole = () => {
    this.syncSelectedJobRolesNumberWithFormInput();
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = this.selectedJobRoles;

    this.router.navigate(['../update-vacancies-job-roles'], { relativeTo: this.route });
  };

  public handleClickedNoOrDoNotKnow = (value: jobOptionsEnum) => {
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
    const userSelectedNoneOrDoNotKnow = this.form.get('noOrDoNotKnow').value !== null;
    if (userSelectedNoneOrDoNotKnow) {
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

  public onSubmit() {
    this.form.controls['noOrDoNotKnow'].updateValueAndValidity();
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

  private onSuccess() {
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = null;
    this.returnToPreviousPage();
  }

  private onError(error: Error) {
    console.log(error);
  }

  private returnToPreviousPage() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  public onCancel(event: Event) {
    event.preventDefault();
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = null;
    this.returnToPreviousPage();
  }
}
