import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
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
  private ethnicityPath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    public route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      disability: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    if (this.worker.disability) {
      this.form.patchValue({
        disability: this.worker.disability,
      });
    }

    this.setUpPageRouting();
  }

  private setUpPageRouting() {
    this.ethnicityPath = this.getRoutePath('ethnicity');
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');

    if (this.insideFlow) {
      this.previous = this.getRoutePath('gender');
      this.next = this.ethnicityPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.previous = this.staffRecordSummaryPath;
    }
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
