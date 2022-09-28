import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-gender',
  templateUrl: './gender.component.html',
})
export class GenderComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Female', tag: 'Female' },
    { value: 'Male', tag: 'Male' },
    { value: 'Other', tag: 'Other' },
    { value: `Don't know`, tag: 'I do not know' },
  ];
  public section = 'Personal details';
  private disabilityPath: string[];
  private staffRecordSummaryPath: string[];

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
      gender: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    if (this.worker.gender) {
      this.form.patchValue({
        gender: this.worker.gender,
      });
    }
    this.setUpPageRouting();
  }

  private setUpPageRouting() {
    this.disabilityPath = this.getRoutePath('disability');
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');

    if (this.insideFlow) {
      this.backService.setBackLink({ url: this.getRoutePath('home-postcode') });
      this.skipRoute = this.disabilityPath;
      this.next = this.disabilityPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
  }

  generateUpdateProps() {
    const { gender } = this.form.controls;
    return gender.value
      ? {
          gender: gender.value,
        }
      : null;
  }
}
