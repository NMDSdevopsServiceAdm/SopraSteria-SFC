import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-social-care-qualification-level',
  templateUrl: './social-care-qualification-level.component.html',
})
export class SocialCareQualificationLevelComponent extends QuestionComponent {
  public qualifications: QualificationLevel[];
  public insideSocialCareQualificationLevelSummaryFlow: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private qualificationService: QualificationService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });
  }

  init(): void {
    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe((qualifications) => {
        this.qualifications = qualifications;
      }),
    );

    if (this.worker.socialCareQualification) {
      this.prefill();
    }

    this.next = this.getRoutePath('other-qualifications');
  }

  private prefill() {
    this.form.patchValue({
      qualification: this.worker.socialCareQualification.qualificationId,
    });
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'qualification',
        type: [
          {
            name: 'required',
            message: 'Please fill required fields.',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { qualification } = this.form.value;
    return {
      socialCareQualification: {
        qualificationId: parseInt(qualification, 10),
      },
    };
  }
}
