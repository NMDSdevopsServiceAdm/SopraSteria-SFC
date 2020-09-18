import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-disability',
  templateUrl: './disability.component.html',
})
export class DisabilityComponent extends QuestionComponent {
  public answersAvailable = ['Yes', 'No', 'Undisclosed', 'Don\'t know'];

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
      disability: null,
    });
  }

  init() {
    if (this.worker.disability) {
      this.form.patchValue({
        disability: this.worker.disability,
      });
    }

    this.next = this.getRoutePath('ethnicity');
    this.previous = this.getRoutePath('gender');
  }

  generateUpdateProps() {
    const { disability } = this.form.value;

    return disability
      ? {
          disability,
        }
      : null;
  }
}
