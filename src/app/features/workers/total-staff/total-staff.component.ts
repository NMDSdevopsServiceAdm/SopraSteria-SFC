import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public returnToDash = false;
  public submitted = false;
  public workplace: Establishment;
  public return: URLStructure;
  public returnCopy: boolean;
  private totalStaffConstraints = { min: 0, max: 999 };
  public formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService
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
    this.workplace = this.route.parent.snapshot.data.establishment;
    const primaryWorkplaceUid = this.route.snapshot.data.primaryWorkplace
      ? this.route.snapshot.data.primaryWorkplace.uid
      : null;

    this.return =
      this.workplace.uid === primaryWorkplaceUid
        ? { url: ['/dashboard'], fragment: 'staff-records' }
        : { url: ['/workplace', this.workplace.uid], fragment: 'staff-records' };

    this.subscriptions.add(
      this.establishmentService.getStaff(this.workplace.uid).subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );

    this.returnToDash = this.workerService.totalStaffReturn;

    if (this.returnToDash || this.workerService.returnTo) {
      this.returnCopy = true;
    }

    if (this.returnToDash) {
      this.backService.setBackLink(this.return);
    } else if (this.workerService.returnTo) {
      this.backService.setBackLink(this.workerService.returnTo);
      this.return = this.workerService.returnTo;
    } else {
      this.backService.setBackLink({
        url: ['/workplace', this.workplace.uid, 'staff-record', 'basic-records-start-screen'],
      });
    }

    this.setupFormErrors();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.workerService.setTotalStaffReturn(false);
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
      this.establishmentService.postStaff(this.workplace.uid, totalStaff).subscribe(
        data => this.onSuccess(data.numberOfStaff),
        error => this.onError(error)
      )
    );
  }

  private onSuccess(numberOfStaff) {
    this.updateWorkplaceSummary(numberOfStaff);
    if (this.returnToDash) {
      this.router.navigate(this.return.url, { fragment: this.return.fragment });
    } else if (this.workerService.returnTo) {
      this.router.navigate(this.workerService.returnTo.url);
    } else {
      this.router.navigate(['create-basic-records'], { relativeTo: this.route.parent });
    }
  }

  private updateWorkplaceSummary(numberOfStaff) {
    this.workplace.numberOfStaff = numberOfStaff;
    this.establishmentService.setState(this.workplace);
  }

  private onError(error) {}

  private setupFormErrors(): void {
    this.formErrorsMap = [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: 'Enter the total number of staff at your workplace',
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
            message: 'Enter the total number of staff as a digit, like 7',
          },
        ],
      },
    ];
  }
}
