import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-flu-jab',
  templateUrl: './flu-jab.component.html',
})
export class FluJabComponent extends QuestionComponent {
  public answersAvailable = [
    { label: 'Yes, they have had a flu vaccination', value: 'Yes' },
    { label: 'No, they have not had a flu vaccination yet',  value: 'No' },
    { label: `Don't know`, value: `Don't know` },
   ];

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
      fluJab: null,
    });
  }

  init() {
    if (this.worker.fluJab) {
      this.form.patchValue({
        fluJab: this.worker.fluJab,
      });
    }

    this.next = this.getRoutePath('national-insurance-number');

    if (this.workerService.hasJobRole(this.worker, 27)) {
      this.previous = this.getRoutePath('mental-health-professional');
    } else if (this.workerService.hasJobRole(this.worker, 23)) {
      this.previous = this.getRoutePath('nursing-specialism');
    } else {
      this.previous = this.getRoutePath('other-job-roles');
    }
  }

  generateUpdateProps() {
    const { fluJab } = this.form.value;

    return fluJab
      ? {
          fluJab,
        }
      : null;
  }
}
