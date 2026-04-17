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
    });

    this.workersFormArray = this.form.get('workers') as UntypedFormArray;

    this.workersByJobRole.groups.forEach((group) => {
      this.workersFormArray.push(
        this.formBuilder.group({
          workerId: group.jobId,
          value: group.annualHourlyPay?.value || null,
          rate: group.annualHourlyPay?.rate || null,
        }),
      );
    });
  }

  validateRow(groupData: any) {
    return (formGroup: UntypedFormGroup) => {
      const valueCtrl = formGroup.get('value');
      const rateCtrl = formGroup.get('rate');

      const value = valueCtrl?.value;
      const rate = rateCtrl?.value;

      // clear previous errors
      valueCtrl.setErrors(valueCtrl.errors);
      rateCtrl.setErrors(rateCtrl.errors);

      // BOTH EMPTY
      if (!value && !rate) {
        valueCtrl.setErrors({ required: true });
        rateCtrl.setErrors({ required: true });
        return null;
      }

      if (!value && rate) {
        valueCtrl.setErrors({ required: true });
      }

      if (value && !rate) {
        rateCtrl.setErrors({ required: true });
      }

      if (value === 'Hourly') {
        if (rate < 2.5 || rate > 200) {
          rateCtrl.setErrors({ range: true });
        }
      }

      if (value === 'Annually') {
        if (rate && !Number.isInteger(Number(rate))) {
          rateCtrl.setErrors({ salary: true });
        }
      }

      return null;
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
      return {
        ...group,
        annualHourlyPay: {
          value: formEntry.value,
          rate: formEntry.rate,
        },
      };
    });

    this.workerService.setWorkersGroupedByJobRole({ groups: updatedWorkers });

    const hasAtLeastOneRate = updatedWorkers.some((group) => group.annualHourlyPay?.rate != null);

    if (hasAtLeastOneRate) {
      this.router.navigate(['../fast-track-confirmation-page'], { relativeTo: this.route });
    } else {
      this.router.navigate(['/workplace', this.workplace.uid, 'update-pay-multiple-staff']);
    }
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
}
