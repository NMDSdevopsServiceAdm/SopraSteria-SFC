import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';
import { AlertService } from '@core/services/alert.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-other-qualifications',
  templateUrl: './other-qualifications.component.html',
})
export class OtherQualificationsComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];
  public cwpQuestionsFlag: boolean;
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
    private featureFlagService: FeatureFlagsService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      otherQualification: null,
    });
  }

  async init() {
    this.cwpQuestionsFlag = await this.featureFlagService.configCatClient.getValueAsync('cwpQuestionsFlag', false);
    this.featureFlagService.cwpQuestionsFlag = this.cwpQuestionsFlag;

    if (this.worker.otherQualification) {
      this.prefill();
    }
    this.cwpQuestionsFlag
      ? (this.next = this.getRoutePath('staff-record-summary'))
      : (this.next = this.getRoutePath('care-workforce-pathway'));
  }

  private prefill(): void {
    this.form.patchValue({
      otherQualification: this.worker.otherQualification,
    });
  }

  generateUpdateProps(): unknown {
    const { otherQualification } = this.form.value;
    if (!otherQualification) {
      return null;
    }
    return {
      otherQualification,
    };
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    const { otherQualification } = this.form.value;

    if (otherQualification === 'Yes') {
      nextRoute.push('other-qualifications-level');
    } else if (otherQualification !== 'Yes' && this.insideFlow && this.cwpQuestionsFlag == true) {
      nextRoute.push('staff-record-summary');
    } else if (otherQualification !== 'Yes' && this.insideFlow && this.cwpQuestionsFlag == false) {
      nextRoute.push('care-workforce-pathway');
    }
    return nextRoute;
  }

  onSubmit(): void {
    super.onSubmit();
    const { otherQualification } = this.form.value;

    if ((!this.submitted || !otherQualification) && this.insideFlow && this.cwpQuestionsFlag == true) {
      this.addCompletedStaffFlowAlert();
    }
  }

  addAlert(): void {
    const { otherQualification } = this.form.value;

    if (otherQualification !== 'Yes' && this.insideFlow && this.cwpQuestionsFlag == true) {
      this.addCompletedStaffFlowAlert();
    }
  }

  addCompletedStaffFlowAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: 'Staff record saved',
    });
  }
  onSuccess(): void {
    this.next = this.determineConditionalRouting();
  }
}
