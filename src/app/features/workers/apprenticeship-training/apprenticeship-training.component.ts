import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-apprenticeship-training',
  templateUrl: './apprenticeship-training.component.html',
})
export class ApprenticeshipTrainingComponent extends QuestionComponent {
  public answersAvailable = ['Yes', 'No', `Don't know`];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      apprenticeshipTraining: null,
    });
  }

  init() {
    if (this.worker.apprenticeshipTraining) {
      this.form.patchValue({
        apprenticeshipTraining: this.worker.apprenticeshipTraining,
      });
    }

    this.next = this.getRoutePath('social-care-qualification');
    this.previous = this.getRoutePath('care-certificate');
  }

  generateUpdateProps() {
    const { apprenticeshipTraining } = this.form.value;

    if (!apprenticeshipTraining) {
      return null;
    }

    return {
      apprenticeshipTraining: apprenticeshipTraining,
    };
  }
}
