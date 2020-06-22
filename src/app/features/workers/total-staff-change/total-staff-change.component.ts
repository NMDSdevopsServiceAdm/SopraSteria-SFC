import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';

@Component({
  selector: 'app-total-staff-change',
  templateUrl: './total-staff-change.component.html',
})
export class TotalStaffChangeComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public returnToDash = false;
  public submitted = false;
  public workplace: Establishment;
  public return: URLStructure;
  public returnCopy: boolean;
  public formErrorsMap: Array<ErrorDetails>;
  private totalStaffConstraints = { min: 0, max: 999 };
  private subscriptions: Subscription = new Subscription();

  constructor(
    public errorSummaryService: ErrorSummaryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private backService: BackService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private totalStaffFormService: TotalStaffFormService
  ) {
    this.form = totalStaffFormService.createForm(formBuilder);
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
      this.router.navigate(['create-staff-record'], { relativeTo: this.route.parent });
    }
  }

  private updateWorkplaceSummary(numberOfStaff) {
    this.workplace.numberOfStaff = numberOfStaff;
    this.establishmentService.setState(this.workplace);
  }

  private onError(error) {}

  private setupFormErrors(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
  }
}
