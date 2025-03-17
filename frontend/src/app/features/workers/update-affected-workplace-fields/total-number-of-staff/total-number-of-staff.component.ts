import { Subscription } from 'rxjs';

import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';

import { EstablishmentService } from '../../../../core/services/establishment.service';

@Component({
  selector: 'app-total-number-of-staff',
  templateUrl: './total-number-of-staff.component.html',
  styleUrls: ['./total-number-of-staff.component.scss'],
})
export class TotalNumberOfStaffComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted: boolean;
  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    protected establishmentService: EstablishmentService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setBackLink();

    this.workplace = this.route.parent.snapshot.data.establishment;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      numberOfStaff: null,
    });
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const totalStaffNumber = this.form.get('numberOfStaff').value;

    this.subscriptions.add(
      this.establishmentService.postStaff(this.workplace.uid, totalStaffNumber).subscribe(
        (data) => this.onSuccess(),
        (error) => this.onError(error),
      ),
    );
  }

  onCancel(event: Event): void {
    event.preventDefault();
  }

  onSuccess(): void {}

  onError(error): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
