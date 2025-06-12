import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { FinalQuestionComponent } from '../final-question/final-question.component';

@Component({
  selector: 'app-other-qualifications-level',
  templateUrl: './other-qualifications-level.component.html',
})
export class OtherQualificationsLevelComponent extends FinalQuestionComponent {
  public qualifications: QualificationLevel[];
  public section = 'Training and qualifications';
  public cwpQuestionsFlag: boolean;
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private qualificationService: QualificationService,
    protected alertService: AlertService,
    private featureFlagService: FeatureFlagsService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
      alertService,
    );

    this.form = this.formBuilder.group({
      qualification: null,
    });
  }

  async init() {
    this.getAndSetQualifications();

    if (this.worker.highestQualification) {
      this.prefill();
    }

    this.cwpQuestionsFlag = await this.featureFlagService.configCatClient.getValueAsync('cwpQuestions', false);
    this.featureFlagService.cwpQuestionsFlag = this.cwpQuestionsFlag;

    this.cwpQuestionsFlag
      ? (this.next = this.getRoutePath('staff-record-summary'))
      : (this.next = this.getRoutePath('care-workforce-pathway'));
  }

  private prefill(): void {
    this.form.patchValue({
      qualification: this.worker.highestQualification.qualificationId,
    });
  }

  public getAndSetQualifications(): void {
    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe((qualifications) => {
        this.qualifications = qualifications;
      }),
    );
  }

  generateUpdateProps(): unknown {
    const { qualification } = this.form.value;
    const props = {
      highestQualification: {
        qualificationId: qualification && parseInt(qualification, 10),
      },
    };
    return props;
  }

  onSubmit(): void {
    super.onSubmit();
    if (!this.submitted && this.insideFlow && this.cwpQuestionsFlag == true) {
      this.addCompletedStaffFlowAlert();
    }
  }

  addAlert(): void {
    if (this.insideFlow && this.cwpQuestionsFlag == true) {
      this.addCompletedStaffFlowAlert();
    }
  }

  protected formValueIsEmpty(): boolean {
    const { qualification } = this.form.value;
    return qualification === null;
  }
}
