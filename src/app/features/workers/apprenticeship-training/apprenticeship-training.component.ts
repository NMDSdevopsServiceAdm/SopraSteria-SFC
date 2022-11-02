import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-apprenticeship-training',
  templateUrl: './apprenticeship-training.component.html',
})
export class ApprenticeshipTrainingComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];

  public section = 'Training and qualifications';
  private socialCareQualificationPath: string[];

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
      apprenticeshipTraining: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.setUpPageRouting();
    if (this.worker.apprenticeshipTraining) {
      this.prefill();
    }
  }

  private prefill(): void {
    this.form.patchValue({
      apprenticeshipTraining: this.worker.apprenticeshipTraining,
    });
  }

  private setUpPageRouting(): void {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');
    this.socialCareQualificationPath = this.getRoutePath('social-care-qualification');

    if (this.insideFlow) {
      this.previous = this.getRoutePath('care-certificate');
      this.next = this.socialCareQualificationPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
  }

  generateUpdateProps() {
    const { apprenticeshipTraining } = this.form.value;

    if (!apprenticeshipTraining) {
      return null;
    }

    return {
      apprenticeshipTraining,
    };
  }
}
