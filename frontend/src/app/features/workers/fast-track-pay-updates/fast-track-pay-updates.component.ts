import { AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRole, WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ErrorDetails } from '@core/model/errorSummary.model';

const radioButtonLabels = [
  { label: 'Hourly', value: 'Hourly', slug: 'hourly' },
  { label: 'Salary', value: 'Annually', slug: 'salary' },
];

const ERROR_MESSAGES = {
  valueRequired: 'Select hourly or salary for the amount entered',
  rateRequired: 'Enter the salary or select a different option',
  range: 'Hourly pay rate must be between £2.50 and £200.00',
  pence: 'You can only have 1 or 2 digits for pence after the decimal point',
  salary: 'Salary must not include pence',
  salaryRange: 'Salary must be between £2,500 and £200,000',
};
@Component({
  selector: 'app-fast-track-pay-updates',
  templateUrl: './fast-track-pay-updates.component.html',
  standalone: false,
})
export class FastTrackPayUpdatesComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public workersByJobRole: WorkersGroupedByJobRoleResponse;
  public formErrorsMap: Array<ErrorDetails>;
  public radioButtonLabels = radioButtonLabels;
  public showErrors = false;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();

    this.workplace = this.route.snapshot.data.establishment;

    let serviceData = this.workerService.getWorkersGroupedByJobRole();
    if (!serviceData?.groups) {
      serviceData = this.route.snapshot.data.workersByJobRole;
      this.workerService.setWorkersGroupedByJobRole({ groups: serviceData.groups });
    }

    this.workersByJobRole = serviceData;

    this.setupForm();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get workersFormGroup(): FormGroup {
    return this.form.get('workers') as FormGroup;
  }

  private buildFormControls(group: any): FormGroup {
    const value = this.formBuilder.control(group.annualHourlyPay?.value);
    const rate = this.formBuilder.control(group.annualHourlyPay?.rate);

    const fg = this.formBuilder.group(
      {
        value,
        rate,
        jobId: group.jobId,
      },
      { updateOn: 'submit' },
    );

    value.setValidators([this.payValueValidator()]);
    rate.setValidators([this.payRateValidator()]);

    return fg;
  }
  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.group({}),
    });
    this.workersByJobRole.groups.forEach((group) => {
      this.workersFormGroup.addControl(`job-${group.jobId}`, this.buildFormControls(group));
    });
  }

  private validationIsActive = signal(false);

  private callValidator(): void {
    this.validationIsActive.set(true);

    Object.values(this.workersFormGroup.controls).forEach((group: any) => {
      group.get('rate')?.updateValueAndValidity();
      group.get('value')?.updateValueAndValidity();
    });
  }

  private payValueValidator(): ValidatorFn {
    return (control) => {
      const parent = control.parent;
      if (!parent) return null;

      const value = control.value;
      const rate = parent.get('rate')?.value;

      if (!value && rate) {
        return { required: true };
      }

      return null;
    };
  }

  private payRateValidator(): ValidatorFn {
    return (control) => {
      const parent = control.parent;
      if (!parent) return null;

      const rate = control.value;
      const value = parent.get('value')?.value;

      if (!rate) return { required: true };

      const numericRate = Number(rate);

      if (isNaN(numericRate)) return { invalidNumber: true };

      if (value === 'Hourly' && (rate < 2.5 || rate > 200)) {
        return { range: true };
      }

      const decimalPart = rate.toString().split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        return { pence: true };
      }

      if (value === 'Annually') {
        if (!Number.isInteger(numericRate)) {
          return { salary: true };
        }

        if (numericRate < 2500 || numericRate > 200000) {
          return { salaryRange: true };
        }
      }
      return null;
    };
  }

  getRowError(group: any): string {
    if (!group) return '';
    const errors = group.get('value')?.errors ?? group.get('rate')?.errors;
    if (!errors) return '';

    const valueErrors = group.get('value')?.errors;
    const rateErrors = group.get('rate')?.errors;

    if (valueErrors) {
      if (valueErrors['required']) {
        return ERROR_MESSAGES.valueRequired;
      }
    }

    if (rateErrors) {
      if (rateErrors['required']) {
        return ERROR_MESSAGES.rateRequired;
      }
      if (rateErrors['range']) {
        return ERROR_MESSAGES.range;
      }
      if (rateErrors['pence']) {
        return ERROR_MESSAGES.pence;
      }
      if (rateErrors['salary']) {
        return ERROR_MESSAGES.salary;
      }
      if (rateErrors['salaryRange']) {
        return ERROR_MESSAGES.salaryRange;
      }
    }

    return '';
  }

  private jobGroupTitle(group: WorkersGroupedByJobRole) {
    const jobTitle = group.title.toLowerCase();
    if (group.title.includes('IT')) {
      return group.title;
    }
    return jobTitle;
  }
  private setupFormErrorsMap(): void {
    this.formErrorsMap = this.workersByJobRole.groups.flatMap((group) => {
      return [
        {
          item: `job-${group.jobId}.value`,
          type: [
            {
              name: 'required',
              message: `${ERROR_MESSAGES.valueRequired} (${this.jobGroupTitle(group)})`,
            },
          ],
        },
        {
          item: `job-${group.jobId}.rate`,
          type: [
            {
              name: 'required',
              message: `${ERROR_MESSAGES.rateRequired}  (${this.jobGroupTitle(group)})`,
            },
            {
              name: 'range',
              message: `${ERROR_MESSAGES.range}  (${this.jobGroupTitle(group)})`,
            },
            {
              name: 'salary',
              message: `${ERROR_MESSAGES.salary}  (${this.jobGroupTitle(group)})`,
            },
            {
              name: 'pence',
              message: `${ERROR_MESSAGES.pence}  (${this.jobGroupTitle(group)})`,
            },
            {
              name: 'salaryRange',
              message: `${ERROR_MESSAGES.salaryRange}  (${this.jobGroupTitle(group)})`,
            },
          ],
        },
      ];
    });
  }
  public onSubmit(): void {
    this.callValidator();
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    this.showErrors = true;

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const updatedWorkers = this.workersByJobRole.groups.map((group) => {
      const formGroup = this.workersFormGroup.get(`job-${group.jobId}`) as FormGroup;

      return {
        ...group,
        annualHourlyPay: {
          value: formGroup.get('value')?.value,
          rate: formGroup.get('rate')?.value,
        },
      };
    });

    this.workerService.setWorkersGroupedByJobRole({ groups: updatedWorkers });

    const hasRate = updatedWorkers.some((w) => w.annualHourlyPay?.rate != null);

    if (hasRate) {
      this.router.navigate(['../fast-track-confirmation-page'], { relativeTo: this.route });
    } else {
      this.returnToUpdatePayForMultipleStaffPage();
    }
  }
  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToUpdatePayForMultipleStaffPage();
  }

  private returnToUpdatePayForMultipleStaffPage(): Promise<boolean> {
    return this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', 'update-pay-for-multiple-staff']);
  }
}
