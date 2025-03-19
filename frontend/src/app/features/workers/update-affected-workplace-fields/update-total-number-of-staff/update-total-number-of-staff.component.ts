import { Subscription } from 'rxjs';

import { Component, ElementRef, ViewChild, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffConstraints, TotalStaffFormService } from '@core/services/total-staff-form.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-update-total-number-of-staff',
  templateUrl: './update-total-number-of-staff.component.html',
})
export class UpdateTotalNumberOfStaffComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean;

  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public min = TotalStaffConstraints.min;
  public max = TotalStaffConstraints.max;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private totalStaffFormService: TotalStaffFormService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private establishmentService: EstablishmentService,
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.setupForm();
    this.setupFormError();
    this.setBackLink();
    this.prefill();
  }

  private setupForm(): void {
    this.form = this.totalStaffFormService.createForm(this.formBuilder, true);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupFormError(): void {
    this.formErrorsMap = this.totalStaffFormService.createFormErrorsMap();
  }

  private prefill(): void {
    this.subscriptions.add(
      this.establishmentService.getStaff(this.workplace.uid).subscribe((staff) => {
        this.form.patchValue({ totalStaff: staff });
      }),
    );
  }

  onSubmit() {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const totalStaffNumber = this.form.get('totalStaff').value;

    this.subscriptions.add(
      this.establishmentService.postStaff(this.workplace.uid, totalStaffNumber).subscribe(
        () => this.onSuccess(),
        (error) => this.onError(error),
      ),
    );
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.returnToPreviousPage();
  }

  onSuccess(): void {
    this.returnToPreviousPage();
  }

  onError(_error: Error): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public returnToPreviousPage() {
    const returnToUrl = this.establishmentService.returnTo?.url;
    if (returnToUrl) {
      this.router.navigate(returnToUrl);
    } else {
      this.location.back();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }
}
