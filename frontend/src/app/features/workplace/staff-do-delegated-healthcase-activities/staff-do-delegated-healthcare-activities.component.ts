import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-do-delegated-healthcare-activities',
  templateUrl: './staff-do-delegated-healthcare-activities.component.html',
})
export class StaffDoDelegatedHealthcareActivitiesComponent extends Question implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.SERVICES;
  public options = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: "Don't know", label: 'I do not know' },
  ];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected careWorkforcePathwayService: CareWorkforcePathwayService,
    protected route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init() {
    this.setupForm();
    this.setPreviousRoute();
    this.skipRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.nextRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.prefill();
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        staffDoDelegatedHealthcareActivities: null,
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const staffDoDelegatedHealthcareActivities = this.establishment.staffDoDelegatedHealthcareActivities;
    if (!staffDoDelegatedHealthcareActivities) return;

    this.form.patchValue({
      staffDoDelegatedHealthcareActivities,
    });
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'service-users'];
  }

  protected generateUpdateProps(): any {
    const { staffDoDelegatedHealthcareActivities } = this.form.value;
    if (!staffDoDelegatedHealthcareActivities) {
      return null;
    }

    return { staffDoDelegatedHealthcareActivities };
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService
        .updateEstablishmentFieldWithAudit(this.establishment.uid, 'staffDoDelegatedHealthcareActivities', props)
        .subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
