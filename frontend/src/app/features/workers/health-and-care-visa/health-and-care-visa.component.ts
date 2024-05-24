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
})
export class HealthAndCareVisaComponent extends QuestionComponent {
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

    this.next = this.getRoutePath('main-job-role');
  }
}
