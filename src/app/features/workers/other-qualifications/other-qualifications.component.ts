import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-qualifications',
  templateUrl: './other-qualifications.component.html',
})
export class OtherQualificationsComponent extends QuestionComponent {
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
      otherQualification: null,
    });
  }

  init() {
    if (this.worker.otherQualification) {
      this.form.patchValue({
        otherQualification: this.worker.otherQualification,
      });
    }

    this.previous =
      this.worker.qualificationInSocialCare === 'Yes'
        ? ['/worker', this.worker.uid, 'social-care-qualification-level']
        : ['/worker', this.worker.uid, 'social-care-qualification'];
  }

  generateUpdateProps() {
    const { otherQualification } = this.form.value;

    if (!otherQualification) {
      return null;
    }

    return {
      otherQualification: otherQualification,
    };
  }

  onSuccess() {
    this.next =
      this.worker.otherQualification === 'Yes'
        ? ['/worker', this.worker.uid, 'other-qualifications-level']
        : ['/worker', this.worker.uid, 'summary'];
  }
}
