import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

@Component({
    selector: 'app-employed-from-outside-uk',
    templateUrl: './employed-from-outside-uk.component.html',
    standalone: false
})
export class EmployedFromOutsideUkComponent extends QuestionComponent {
  public answersAvailable = this.internationalRecruitmentService.getEmployedFromOutsideUkAnswers();

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    public route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    public internationalRecruitmentService: InternationalRecruitmentService,
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
