import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ErrorDetails } from '@core/model/errorSummary.model';

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
  public submitted = false;
  public workersFormArray: UntypedFormArray;

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.workplace = this.route.snapshot.data.establishment;
    this.workersByJobRole = this.route.snapshot.data.workersByJobRole;

    let serviceData = this.workerService.getWorkersGroupedByJobRole();

    if (!serviceData || !serviceData.groups) {
      serviceData = this.route.snapshot.data.workersByJobRole;
      this.workerService.setWorkersGroupedByJobRole({ groups: serviceData.groups });
    }
    this.workersByJobRole = serviceData;

    this.setupForm();

    this.setupFormErrorsMap();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.array([]),

      rate: this.formBuilder.control(null),
      value: this.formBuilder.control(null),
    });

    this.workersFormArray = this.form.get('workers') as UntypedFormArray;

    this.workersByJobRole.groups.forEach((group) => {
      this.workersFormArray.push(
        this.formBuilder.group(
          {
            workerId: group.jobId,
            value: group.annualHourlyPay?.value || null,
            rate: group.annualHourlyPay?.rate || null,
          },
          { validators: this.validateRow(), updateOn: 'submit' },
        ),
      );
    });
  }

  validateRow() {
    return (formGroup: UntypedFormGroup) => {
      const valueCtrl = formGroup.get('value');
      const rateCtrl = formGroup.get('rate');

      const value = valueCtrl?.value;
      const rate = rateCtrl?.value;

      const valueErrors: any = {};
      const rateErrors: any = {};

      if (!value && !rate) {
        valueErrors.required = true;
        rateErrors.required = true;
      }

      if (!value && rate) {
        valueErrors.required = true;
      }

      if (value && !rate) {
        rateErrors.required = true;
      }

      if (value === 'Hourly' && (rate < 2.5 || rate > 200)) {
        rateErrors.range = true;
      }

      if (value === 'Annually' && rate && !Number.isInteger(Number(rate))) {
        rateErrors.salary = true;
      }

      valueCtrl?.setErrors(Object.keys(valueErrors).length ? valueErrors : null);
      rateCtrl?.setErrors(Object.keys(rateErrors).length ? rateErrors : null);

      return null;
    };
  }

  // 👉 Row-level error messages
  getRowError(index: number, control: 'rate' | 'value'): string {
    const errors = this.workersFormArray.at(index).get(control)?.errors;
    if (!errors) return '';

    if (errors['required']) {
      return control === 'rate'
        ? 'Enter the salary or select a different option'
        : 'Select hourly or salary for the amount entered';
    }

    if (errors['range']) {
      return 'Hourly pay rate must be between £2.50 and £200.00';
    }

    if (errors['salary']) {
      return 'Salary must not include pence';
    }

    return '';
  }

  get errorSummaryForm(): UntypedFormGroup {
    const summaryForm = this.formBuilder.group({
      rate: this.formBuilder.control(null),
      value: this.formBuilder.control(null),
    });

    let hasRateError = false;
    let hasValueError = false;

    this.workersFormArray.controls.forEach((group) => {
      if (group.get('rate')?.errors) hasRateError = true;
      if (group.get('value')?.errors) hasValueError = true;
    });

    if (hasRateError) {
      summaryForm.get('rate')?.setErrors({ invalid: true });
    }

    if (hasValueError) {
      summaryForm.get('value')?.setErrors({ invalid: true });
    }

    return summaryForm;
  }

  getFirstInvalidIndex(control: 'rate' | 'value'): number | null {
    for (let i = 0; i < this.workersFormArray.length; i++) {
      if (this.workersFormArray.at(i).get(control)?.invalid) {
        return i;
      }
    }
    return null;
  }

  public onSubmit(): void {
    this.submitted = true;

    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const updatedWorkers = this.workersFormArray.value.map((formEntry, index) => ({
      ...this.workersByJobRole.groups[index],
      annualHourlyPay: {
        value: formEntry.value,
        rate: formEntry.rate,
      },
    }));

    this.workerService.setWorkersGroupedByJobRole({ groups: updatedWorkers });

    const hasRate = updatedWorkers.some((w) => w.annualHourlyPay?.rate != null);

    if (hasRate) {
      this.router.navigate(['../fast-track-confirmation-page'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', 'update-pay-for-multiple-staff']);
    }
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'rate',
        type: [{ name: 'invalid', message: 'Enter the salary or select a different option' }],
      },
      {
        item: 'value',
        type: [{ name: 'invalid', message: 'Select hourly or salary for the amount entered' }],
      },
    ];
  }
}
