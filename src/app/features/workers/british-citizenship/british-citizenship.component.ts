import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-british-citizenship',
  templateUrl: './british-citizenship.component.html',
})
export class BritishCitizenshipComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];
  public section = 'Personal details';
  private countryOfBirthPath: string[];
  public insideBritishCitizenshipSummaryFlow: boolean;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group({
      britishCitizenship: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.next = this.getRoutePath('country-of-birth');

    if (this.worker.britishCitizenship) {
      this.form.patchValue({
        britishCitizenship: this.worker.britishCitizenship,
      });
    }
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
