import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffFormService } from '@core/services/total-staff-form.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-staff-change',
  templateUrl: './total-staff-change.component.html',
})
export class TotalStaffChangeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
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
    private formBuilder: UntypedFormBuilder,
    private backLinkService: BackLinkService,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private totalStaffFormService: TotalStaffFormService,
  ) {
    this.form = totalStaffFormService.createForm(formBuilder);
  }

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    const primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;

    this.return =
      this.workplace.uid === primaryWorkplaceUid
        ? { url: ['/dashboard'], fragment: 'staff-records' }
        : { url: ['/workplace', this.workplace.uid], fragment: 'staff-records' };

    this.returnToDash = this.workerService.totalStaffReturn;

    if (this.returnToDash || this.workerService.returnTo) {
      this.returnCopy = true;
    }

    this.backLinkService.showBackLink();

    this.setupFormErrors();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.workerService.setTotalStaffReturn(false);
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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
        (data) => this.onSuccess(data.numberOfStaff),
        (error) => this.onError(error),
      ),
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
