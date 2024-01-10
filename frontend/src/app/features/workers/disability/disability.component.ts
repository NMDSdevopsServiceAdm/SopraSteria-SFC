import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-disability',
  templateUrl: './disability.component.html',
})
export class DisabilityComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: 'Undisclosed', tag: 'They preferred not to say' },
    { value: `Don't know`, tag: 'I do not know' },
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
