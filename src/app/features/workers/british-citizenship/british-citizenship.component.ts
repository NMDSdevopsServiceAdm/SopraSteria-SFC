import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
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

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      britishCitizenship: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.setUpPageRouting();

    if (this.worker.britishCitizenship) {
      this.form.patchValue({
        britishCitizenship: this.worker.britishCitizenship,
      });
    }
  }

  private setUpPageRouting() {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');
    this.countryOfBirthPath = this.getRoutePath('country-of-birth');

    if (this.insideFlow) {
      this.backService.setBackLink({ url: this.getRoutePath('nationality') });
      this.skipRoute = this.countryOfBirthPath;
      this.next = this.countryOfBirthPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
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
