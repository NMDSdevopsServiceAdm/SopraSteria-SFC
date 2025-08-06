
import { Component, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

@Component({
  selector: 'app-staff-what-kind-of-delegated-healthcare-activites',
  templateUrl: './staff-what-kind-of-delegated-healthcare-activites.component.html',
})
export class StaffWhatKindOfDelegatedHealthcareActivitiesComponent extends Question implements OnInit  {
  public section = WorkplaceFlowSections.SERVICES;

   constructor(
      protected formBuilder: UntypedFormBuilder,
      protected router: Router,
      protected backService: BackService,
      protected errorSummaryService: ErrorSummaryService,
      protected establishmentService: EstablishmentService,
      protected careWorkforcePathwayService: CareWorkforcePathwayService,
      protected route: ActivatedRoute,
      private alertService: AlertService,
    ) {
      super(formBuilder, router, backService, errorSummaryService, establishmentService);
    }


  init(): void {
    this.setupForm();
    this.skipRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.nextRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.setPreviousRoute()
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'staff-do-delegated-healthcare-activities'];
  }

   setupForm() {
    this.form = this.formBuilder.group(
      {
        staffWhatKindOfDelegatedHealthcareActivities: null,
      },
      { updateOn: 'submit' },
    );
  }

  protected generateUpdateProps(): any {
    const { staffWhatKindOfDelegatedHealthcareActivities } = this.form.value;
    if (!staffWhatKindOfDelegatedHealthcareActivities) {
      return null;
    }

    return { staffWhatKindOfDelegatedHealthcareActivities };
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService
        .updateEstablishmentFieldWithAudit(this.establishment.uid, 'staffWhatKindOfDelegatedHealthcareActivities', props)
        .subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
    );
  }
}
