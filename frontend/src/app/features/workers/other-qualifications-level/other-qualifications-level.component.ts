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

import { FinalQuestionComponent } from '../final-question/final-question.component';

@Component({
  selector: 'app-other-qualifications-level',
  templateUrl: './other-qualifications-level.component.html',
  standalone: false,
})
export class OtherQualificationsLevelComponent extends FinalQuestionComponent {
  public qualifications: QualificationLevel[];
  public section = 'Training and qualifications';

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
    private qualificationService: QualificationService,
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

    const shouldSkipCareWorkforcePathwayQuestion = this.worker.mainJob?.excludedFromCareWorkforcePathway;
    if (shouldSkipCareWorkforcePathwayQuestion) {
      this.continueToNextQuestion = false;
      this.next = this.getRoutePath('staff-record-summary');
    } else {
      this.continueToNextQuestion = true;
      this.next = this.getRoutePath('care-workforce-pathway');
    }
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

  protected formValueIsEmpty(): boolean {
    const { qualification } = this.form.value;
    return qualification === null;
  }
}
