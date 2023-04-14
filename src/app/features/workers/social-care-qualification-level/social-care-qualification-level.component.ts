import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
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
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private qualificationService: QualificationService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      qualification: null,
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

  generateUpdateProps() {
    const { qualification } = this.form.value;

    const props = {
      socialCareQualification: {
        qualificationId: qualification && parseInt(qualification, 10),
      },
    };
    return props;
  }
}
