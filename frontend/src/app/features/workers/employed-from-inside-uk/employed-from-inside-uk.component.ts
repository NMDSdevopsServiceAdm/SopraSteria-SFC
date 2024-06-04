import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-employed-from-inside-uk',
  templateUrl: './employed-from-inside-uk.component.html',
})
export class EmployedFromInsideUkComponent extends QuestionComponent {
  public answersAvailable = [
    { tag: 'Outside the UK', value: 'No' },
    { tag: 'Inside the UK', value: 'Yes' },
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
      employedFromInsideUk: null,
    });
  }

  init() {
    if (this.worker.employedFromInsideUk) {
      this.form.patchValue({
        employedFromInsideUk: this.worker.employedFromInsideUk,
      });
    }

    this.next = this.getRoutePath('main-job-start-date');
  }

  generateUpdateProps(): unknown {
    const { employedFromInsideUk } = this.form.value;

    if (!employedFromInsideUk) {
      return null;
    }

    return {
      employedFromInsideUk,
    };
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();

    if (this.insideFlow) {
      nextRoute.push('main-job-start-date');
    }

    return nextRoute;
  }

  onSuccess(): void {
    this.next = this.determineConditionalRouting();
  }
}
