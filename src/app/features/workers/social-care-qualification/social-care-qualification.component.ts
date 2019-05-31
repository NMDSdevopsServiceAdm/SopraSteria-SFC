import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-social-care-qualification',
  templateUrl: './social-care-qualification.component.html',
})
export class SocialCareQualificationComponent extends QuestionComponent {
  public answersAvailable = ['Yes', 'No', `Don't know`];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      qualificationInSocialCare: null,
    });
  }

  init() {
    if (this.worker.qualificationInSocialCare) {
      this.form.patchValue({
        qualificationInSocialCare: this.worker.qualificationInSocialCare,
      });
    }

    this.previous = ['/worker', this.worker.uid, 'apprenticeship-training'];
  }

  generateUpdateProps() {
    const { qualificationInSocialCare } = this.form.value;

    if (!qualificationInSocialCare) {
      return null;
    }

    return {
      qualificationInSocialCare: qualificationInSocialCare,
    };
  }

  onSuccess() {
    this.next =
      this.worker.qualificationInSocialCare === 'Yes'
        ? ['/worker', this.worker.uid, 'social-care-qualification-level']
        : ['/worker', this.worker.uid, 'other-qualifications'];
  }
}
