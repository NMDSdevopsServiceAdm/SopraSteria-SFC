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
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        staffDoDelegatedHealthcareActivities: null,
      },
      { updateOn: 'submit' },
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
