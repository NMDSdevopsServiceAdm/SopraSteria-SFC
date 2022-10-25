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
  public answersAvailable = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

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
      this.setUpConditionalQuestionLogic(this.worker.qualificationInSocialCare);
      this.prefill();
    }

    this.subscriptions.add(
      this.form.get('qualificationInSocialCare').valueChanges.subscribe((value) => {
        if (!this.insideFlow) {
          this.setUpConditionalQuestionLogic(value);
        }
      }),
    );

    this.next = this.getRoutePath('other-qualifications');
    this.previous = this.getReturnPath();
  }

  private prefill(): void {
    this.form.patchValue({
      qualificationInSocialCare: this.worker.qualificationInSocialCare,
    });
  }

  public setUpConditionalQuestionLogic(qualificationInSocialCareValue): void {
    if (qualificationInSocialCareValue === 'Yes') {
      this.conditionalQuestionUrl = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'social-care-qualification-level',
      ];
    } else {
      this.conditionalQuestionUrl = this.getRoutePath('staff-record-summary');
    }
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
