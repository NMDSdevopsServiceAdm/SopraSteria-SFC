import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-british-citizenship',
  templateUrl: './british-citizenship.component.html',
})
export class BritishCitizenshipComponent extends QuestionComponent {
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
      britishCitizenship: null,
    });
  }

  init() {
    if (this.worker.nationality && this.worker.nationality.value === 'British') {
      this.router.navigate(this.getRoutePath('nationality'), { replaceUrl: true });
    }

    if (this.worker.britishCitizenship) {
      this.form.patchValue({
        britishCitizenship: this.worker.britishCitizenship,
      });
    }

    this.next = this.getRoutePath('country-of-birth');
    this.previous = this.getRoutePath('nationality');
  }

  generateUpdateProps() {
    const { britishCitizenship } = this.form.value;

    return britishCitizenship
      ? {
          britishCitizenship,
        }
      : null;
  }
}
