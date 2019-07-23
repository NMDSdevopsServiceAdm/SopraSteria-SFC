import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-gender',
  templateUrl: './gender.component.html',
})
export class GenderComponent extends QuestionComponent {
  public answersAvailable = ['Female', 'Male', 'Other', `Don't know`];

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
      gender: null,
    });
  }

  init() {
    if (this.worker.gender) {
      this.form.patchValue({
        gender: this.worker.gender,
      });
    }

    this.next = this.getRoutePath('disability');
    this.previous = this.getRoutePath('home-postcode');
  }

  generateUpdateProps() {
    const { gender } = this.form.controls;

    return gender.value
      ? {
          gender: gender.value,
        }
      : null;
  }
}
