import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
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

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      apprenticeshipTraining: null,
    });
  }

  init() {
    this.next = this.getRoutePath('social-care-qualification');

    if (this.worker.apprenticeshipTraining) {
      this.prefill();
    }
  }

  private prefill(): void {
    this.form.patchValue({
      apprenticeshipTraining: this.worker.apprenticeshipTraining,
    });
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
