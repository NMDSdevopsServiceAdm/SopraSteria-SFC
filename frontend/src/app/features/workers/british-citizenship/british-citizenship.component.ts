import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
    selector: 'app-british-citizenship',
    templateUrl: './british-citizenship.component.html',
    standalone: false
})
export class BritishCitizenshipComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];
  public section = 'Personal details';

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      britishCitizenship: null,
    });
  }

  init() {
    this.next = this.getRoutePath('country-of-birth');

    if (this.worker.britishCitizenship) {
      this.form.patchValue({
        britishCitizenship: this.worker.britishCitizenship,
      });
    }
  }

  generateUpdateProps() {
    const { britishCitizenship } = this.form.value;

    let extraFields = {};
    if (
      (this.worker && britishCitizenship === 'Yes') ||
      (this.worker && britishCitizenship === "Don't know" && this.worker.nationality.value === "Don't know")
    ) {
      this.worker.healthAndCareVisa = null;
      this.worker.employedFromOutsideUk = null;
      extraFields = { healthAndCareVisa: null, employedFromOutsideUk: null };
    }

    return britishCitizenship
      ? {
          britishCitizenship,
          ...extraFields,
        }
      : null;
  }
}
