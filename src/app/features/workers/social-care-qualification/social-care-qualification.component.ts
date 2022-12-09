import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-social-care-qualification',
  templateUrl: './social-care-qualification.component.html',
})
export class SocialCareQualificationComponent extends QuestionComponent {
  public answersAvailable = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      qualificationInSocialCare: null,
    });
  }

  init() {
    if (this.worker.qualificationInSocialCare) {
      this.prefill();
    }
    this.next = this.getRoutePath('other-qualifications');
  }

  private prefill(): void {
    this.form.patchValue({
      qualificationInSocialCare: this.worker.qualificationInSocialCare,
    });
  }

  generateUpdateProps(): unknown {
    const { qualificationInSocialCare } = this.form.value;

    if (!qualificationInSocialCare) {
      return null;
    }

    return {
      qualificationInSocialCare,
    };
  }

  private determineBaseRoute(): string[] {
    if (this.wdfEditPageFlag) {
      return ['wdf', 'staff-record', this.worker.uid];
    }
    if (!this.insideFlow) {
      return this.getRoutePath('');
    } else {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid];
    }
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    const { qualificationInSocialCare } = this.form.value;

    if (qualificationInSocialCare === 'Yes') {
      nextRoute.push('social-care-qualification-level');
    } else if (qualificationInSocialCare !== 'Yes' && this.insideFlow) {
      nextRoute.push('other-qualifications');
    }
    return nextRoute;
  }

  onSuccess(): void {
    this.next = this.determineConditionalRouting();
  }
}
