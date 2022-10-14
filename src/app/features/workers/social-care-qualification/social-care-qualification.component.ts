import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-social-care-qualification',
  templateUrl: './social-care-qualification.component.html',
})
export class SocialCareQualificationComponent extends QuestionComponent {
  public answersAvailable = ['Yes', 'No', `I do not know`];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

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

    this.next = this.getRoutePath('other-qualifications');
    this.previous = this.getReturnPath();
  }

  private getReturnPath() {
    if (this.insideFlow && this.workerService.addStaffRecordInProgress) {
      return this.getRoutePath('apprenticeship-training');
    }

    if (this.insideFlow) {
    return this.workplace?.uid === this.primaryWorkplace?.uid ? ['/dashboard'] : [`/workplace/${this.workplace.uid}`];
  }
    return this.getRoutePath('');
  }

  generateUpdateProps() {
    const { qualificationInSocialCare } = this.form.value;

    if (!qualificationInSocialCare) {
      return null;
    }

    return {
      qualificationInSocialCare,
    };
  }

  onSuccess() {
    this.next =
    this.form.value.qualificationInSocialCare === 'Yes'
        ? this.getRoutePath('social-care-qualification-level')
        : this.getRoutePath('other-qualifications');
  }
}
