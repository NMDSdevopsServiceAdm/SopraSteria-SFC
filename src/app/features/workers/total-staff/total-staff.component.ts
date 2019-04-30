import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  private totalStaffConstraints = { min: 0, max: 999 };
  private formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService
  ) {
    this.form = this.formBuilder.group({
      totalStaff: [
        null,
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.min(this.totalStaffConstraints.min),
          Validators.max(this.totalStaffConstraints.max),
        ],
      ],
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );

    this.backService.setBackLink({ url: ['/worker/create-staff-record'] });

    this.setupFormErrors();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { totalStaff } = this.form.value;

    this.subscriptions.add(
      this.establishmentService.postStaff(totalStaff).subscribe(() => this.onSuccess(), error => this.onError(error))
    );
  }

  private onSuccess() {
    this.router.navigate(['/worker', 'create-basic-records']);
  }

  private onError(error) {}

  private setupFormErrors(): void {
    this.formErrorsMap = [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: 'Total Staff is required.',
          },
          {
            name: 'min',
            message: `Total Staff must be greater than or equal to ${this.totalStaffConstraints.min}`,
          },
          {
            name: 'max',
            message: `Total Staff must be lower than or equal to ${this.totalStaffConstraints.max}`,
          },
          {
            name: 'pattern',
            message: 'Total Staff must be a number.',
          },
        ],
      },
    ];
  }
}
