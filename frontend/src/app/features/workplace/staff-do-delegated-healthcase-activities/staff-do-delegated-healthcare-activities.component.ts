import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
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
  private returnIsSetToHomePage: boolean;
  public allDelegatedHealthcareActivities: Array<DelegatedHealthcareActivity>;
  public dhaDefinition: string;
  public shouldDisplayWarningMessage: boolean = false;
  public staffWhatKindDelegatedHealthcareActivities: any;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
    private alertService: AlertService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init() {
    this.setupForm();
    this.setPreviousRoute();
    this.skipRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.nextRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.prefill();
    this.dhaDefinition = this.delegatedHealthcareActivitiesService.dhaDefinition;
    this.checkWhetherShouldDisplayWarning();
    this.allDelegatedHealthcareActivities = this.route.snapshot.data?.delegatedHealthcareActivities;
    this.staffWhatKindDelegatedHealthcareActivities = this.establishment.staffWhatKindDelegatedHealthcareActivities;

    this.returnIsSetToHomePage = this.establishmentService.returnIsSetToHomePage();
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

  private checkWhetherShouldDisplayWarning(): void {
    const inNewWorkplaceFlow = !this.return;
    const alreadyAnsweredNo = this.establishment.staffDoDelegatedHealthcareActivities === 'No';

    if (inNewWorkplaceFlow || alreadyAnsweredNo) {
      return;
    }

    this.shouldDisplayWarningMessage = this.route.snapshot.data?.workerHasDHAAnswered;
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService
        .updateEstablishmentFieldWithAudit(this.establishment.uid, 'StaffDoDelegatedHealthcareActivities', props)
        .subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
    );
  }

  protected addAlert(): void {
    if (this.returnIsSetToHomePage) {
      this.alertService.addAlert({
        type: 'success',
        message: 'Delegated healthcare activity information saved',
      });
    }
  }

  protected onSuccess(): void {
    const { staffDoDelegatedHealthcareActivities } = this.form.value;

    if (staffDoDelegatedHealthcareActivities === 'Yes') {
      this.nextRoute = ['/workplace', this.establishment.uid, 'what-kind-of-delegated-healthcare-activities'];
      this.submitAction = { action: 'continue', save: true };
    } else {
      this.nextRoute = this.skipRoute;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
