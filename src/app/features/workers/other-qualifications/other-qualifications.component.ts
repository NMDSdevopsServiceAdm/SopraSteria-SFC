import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-qualifications',
  templateUrl: './other-qualifications.component.html',
})
export class OtherQualificationsComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
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
      otherQualification: null,
    });
  }

  init(): void {
    this.setUpConditionalQuestionLogic(this.worker.otherQualification);
    if (this.worker.otherQualification) {
      this.prefill();
    }

    this.next =
      this.worker.otherQualification === 'Yes'
        ? this.getRoutePath('other-qualifications-level')
        : this.getRoutePath('');

    this.previous = this.getReturnPath();

    this.subscriptions.add(
      this.form.get('otherQualification').valueChanges.subscribe((value) => {
        if (!this.insideFlow) {
          this.setUpConditionalQuestionLogic(value);
        }
      }),
    );
  }

  private prefill(): void {
    this.form.patchValue({
      otherQualification: this.worker.otherQualification,
    });
  }

  public setUpConditionalQuestionLogic(otherQualification): void {
    if (otherQualification === 'Yes') {
      this.conditionalQuestionUrl = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'other-qualifications-level',
      ];
    } else {
      this.conditionalQuestionUrl = this.getRoutePath('staff-record-summary');
    }
  }

  getReturnPath() {
    if (this.insideFlow) {
      return this.worker.qualificationInSocialCare === 'Yes'
        ? this.getRoutePath('social-care-qualification-level')
        : this.getRoutePath('social-care-qualification');
    }
    return this.getRoutePath('');
  }

  generateUpdateProps(): unknown {
    const { otherQualification } = this.form.value;

    if (!otherQualification) {
      return null;
    }

    return {
      otherQualification,
    };
  }
}
