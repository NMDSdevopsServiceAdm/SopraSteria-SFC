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
    this.insideSocialCareQualificationLevelSummaryFlow =
      this.route.parent.snapshot.url[0].path === 'social-care-qualification-level-summary-flow';
    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe((qualifications) => {
        this.qualifications = qualifications;
      }),
    );

    if (this.worker.socialCareQualification) {
      this.prefill();
    }
    this.setUpPageNavigation();
  }

  private prefill() {
    this.form.patchValue({
      qualification: this.worker.socialCareQualification.qualificationId,
    });
  }

  private setUpPageNavigation() {
    if (this.insideFlow && !this.insideSocialCareQualificationLevelSummaryFlow) {
      this.next = this.getRoutePath('other-qualifications');
      this.previous = this.getRoutePath('social-care-qualification');
    } else if (this.insideSocialCareQualificationLevelSummaryFlow) {
      this.next = this.getRoutePath('');
      this.previous = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'social-care-qualification',
      ];
    } else {
      this.next = this.getRoutePath('');
      this.previous = this.getRoutePath('');
    }
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
