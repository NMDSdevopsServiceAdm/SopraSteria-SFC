import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-employed-from-outside-uk',
  templateUrl: './employed-from-outside-uk.component.html',
})
export class EmployedFromOutsideUkComponent extends QuestionComponent {
  public answersAvailable = [
    { tag: 'Outside the UK', value: 'Yes' },
    { tag: 'Inside the UK', value: 'No' },
    { tag: 'I do not know', value: `Don't know` },
  ];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    public route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      employedFromOutsideUk: null,
    });
  }

  init() {
    if (this.worker.employedFromOutsideUk) {
      this.form.patchValue({
        employedFromOutsideUk: this.worker.employedFromOutsideUk,
      });
    }

    this.next = this.getRoutePath('main-job-start-date');
  }

  generateUpdateProps(): unknown {
    const { employedFromOutsideUk } = this.form.value;

    if (!employedFromOutsideUk) {
      return null;
    }

    return {
      employedFromOutsideUk,
    };
  }
}
