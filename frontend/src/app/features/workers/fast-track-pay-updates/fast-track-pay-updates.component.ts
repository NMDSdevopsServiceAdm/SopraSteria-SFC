import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { Establishment } from '@core/model/establishment.model';
import { WorkersGroupedByJobRoleResponse } from '@core/model/worker.model';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private backLinkService: BackLinkService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.workplace = this.route.snapshot.data.establishment;
    this.workersByJobRole = this.route.snapshot.data.workersByJobRole;
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
    });

    const workersFormArray = this.form.get('workers') as UntypedFormArray;

    this.workersByJobRole.groups.forEach((group) => {
      workersFormArray.push(
        this.formBuilder.group(
          {
            workerId: group.jobId,
            value: null,
            rate: null,
          },
          { validators: this.validateRow(group) },
        ),
      );
    });
  }

  validateRow(groupData: any) {
    return (formGroup: UntypedFormGroup) => {
      const value = formGroup.get('value')?.value;
      const rate = formGroup.get('rate')?.value;

      const errors: any = {};

      if (!value && rate) {
        errors.value = 'required'; // ✅ matches formErrorsMap
      }

      if (value === 'Hourly') {
        if (rate < 2.5 || rate > 200) {
          errors.rate = 'range'; // 👈 add this type
        }
      }

      if (value === 'Annually') {
        if (rate && !Number.isInteger(Number(rate))) {
          errors.rate = 'salary'; // ✅ already exists
        }
      }

      if (rate && !/^\d+(\.\d{1,2})?$/.test(rate)) {
        errors.rate = 'limitDigit'; // ✅ already exists
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const workersFormValues = this.form.get('workers').value;

    const updatedWorkers = this.workersByJobRole.groups.map((group, index) => {
      const formEntry = workersFormValues[index];
      const annualHourlyPay = { value: formEntry.value, rate: formEntry.rate };

      return { ...group, annualHourlyPay };
    });

    this.workerService.setWorkersGroupedByJobRole({ groups: updatedWorkers });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'rate',
        type: [
          {
            name: 'required',
            message: 'Enter the salary or select a different option',
          },
          {
            name: 'salary',
            message: 'Salary must not include pence',
          },
          {
            name: 'limitDigit',
            message: 'You can only have 1 or 2 digits for pence after the decimal point',
          },
          {
            name: 'range',
            message: 'Hourly pay rate must be between £2.50 and £200.00',
          },
        ],
      },
      {
        item: 'value',
        type: [
          {
            name: 'required',
            message: 'Select hourley or salary for the amount entered',
          },
        ],
      },
    ];
  }

  // protected addErrorLinkFunctionality(): void {
  //   if (!this.errorSummaryService.formEl$.value) {
  //     this.errorSummaryService.formEl$.next(this.formEl);
  //   }
  // }
}
