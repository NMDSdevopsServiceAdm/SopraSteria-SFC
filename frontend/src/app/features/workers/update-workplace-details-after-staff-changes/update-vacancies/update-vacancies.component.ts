import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { jobOptionsEnum, Vacancy } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import lodash from 'lodash';

@Component({
  selector: 'app-update-vacancies',
  templateUrl: './update-vacancies.component.html',
  styleUrl: './update-vacancies.component.scss',
})
export class UpdateVacanciesComponent {
  @ViewChild('formEl') formEl: ElementRef;

  public heading: string;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;
  public selectedJobRoles: Array<Vacancy> = [];
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

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.setupTexts();
    this.prefill();

    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  public setupTexts() {
    this.heading = 'Update your current staff vacancies';
  }

  public setupForm() {
    this.form = this.formBuilder.group({
      jobRoleNumbers: this.formBuilder.array([]),
    });

    this.selectedJobRoles.forEach((jobRole) => {
      const initialValue = jobRole.total ?? '';
      this.jobRoleNumbers.push(
        this.formBuilder.control(initialValue, {
          validators: [
            Validators.required,
            Validators.min(this.minNumberPerJobRole),
            Validators.max(this.maxNumberPerJobRole),
          ],
          updateOn: 'submit',
        }),
      );
    });
  }

  get jobRoleNumbers(): UntypedFormArray {
    return this.form.get('jobRoleNumbers') as UntypedFormArray;
  }

  public handleNumberChange(event: Event) {}

  public setupFormErrorsMap() {}

  public setBackLink() {
    this.backlinkService.showBackLink();
  }

  public prefill() {
    const vacanciesFromBackend = this.establishmentService.establishment.vacancies;
    if (Array.isArray(vacanciesFromBackend)) {
      this.selectedJobRoles = vacanciesFromBackend;
      this.updateTotalNumber();
    }
  }

  protected updateTotalNumber(): void {
    this.totalNumber = lodash.sumBy(this.selectedJobRoles, 'total');
  }

  public onSubmit() {}

  public onCancel(event: Event) {
    event.preventDefault();
  }
}
