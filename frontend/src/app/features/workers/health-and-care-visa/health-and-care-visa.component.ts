import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
    selector: 'app-health-and-care-visa',
    templateUrl: './health-and-care-visa.component.html',
    standalone: false
})
export class HealthAndCareVisaComponent extends QuestionComponent {
  public answersAvailable = [
    { tag: 'Yes', value: 'Yes' },
    { tag: 'No', value: 'No' },
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
      healthAndCareVisa: null,
    });
  }

  init() {
    if (this.worker.healthAndCareVisa) {
      this.form.patchValue({
        healthAndCareVisa: this.worker.healthAndCareVisa,
      });
    }

    this.next = this.getRoutePath('main-job-start-date');
  }

  generateUpdateProps(): unknown {
    const { healthAndCareVisa } = this.form.value;

    if (!healthAndCareVisa) {
      return null;
    }
    let extraFields = {};
    if (healthAndCareVisa !== 'Yes') {
      this.worker.employedFromOutsideUk = null;
      extraFields = { employedFromOutsideUk: null };
    }

    return {
      healthAndCareVisa,
      ...extraFields,
    };
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    const { healthAndCareVisa } = this.form.value;

    if (healthAndCareVisa === 'Yes') {
      nextRoute.push('inside-or-outside-of-uk');
    } else if (this.insideFlow) {
      nextRoute.push('main-job-start-date');
    }
    return nextRoute;
  }

  onSuccess(): void {
    this.next = this.determineConditionalRouting();
  }
}
