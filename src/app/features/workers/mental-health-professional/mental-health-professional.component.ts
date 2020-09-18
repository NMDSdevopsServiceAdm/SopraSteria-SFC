import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-mental-health-professional',
  templateUrl: './mental-health-professional.component.html',
})
export class MentalHealthProfessionalComponent extends QuestionComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', 'Don\'t know'];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      approvedMentalHealthWorker: null,
    });
  }

  init(): void {
    if (!this.workerService.hasJobRole(this.worker, 27)) {
      this.router.navigate(this.getRoutePath('staff-details'), { replaceUrl: true });
    }

    if (this.worker.approvedMentalHealthWorker) {
      this.form.patchValue({
        approvedMentalHealthWorker: this.worker.approvedMentalHealthWorker,
      });
    }

    this.next = this.getRoutePath('flu-jab');
    this.previous = this.workerService.hasJobRole(this.worker, 23)
      ? this.getRoutePath('nursing-specialism')
      : this.getRoutePath('other-job-roles');
  }

  generateUpdateProps() {
    const { approvedMentalHealthWorker } = this.form.controls;

    return approvedMentalHealthWorker.value
      ? {
          approvedMentalHealthWorker: approvedMentalHealthWorker.value,
        }
      : null;
  }
}
