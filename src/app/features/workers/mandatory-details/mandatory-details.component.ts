import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-mandatory-details',
  templateUrl: './mandatory-details.component.html',
})
export class MandatoryDetailsComponent extends QuestionComponent {
  public returnHere: URLStructure;

  constructor(
    private alertService: AlertService,
    protected  route: ActivatedRoute,
    protected workerService: WorkerService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,

  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);
  }

  init() {
    this.returnHere = {url: [this.router.url]};
    this.next = this.getRoutePath('main-job-start-date');
    this.previous = this.getRoutePath('staff-details');
  }

  navigateToDashboard(event: Event) {
    event.preventDefault();
    const url =
      this.workplace.uid === this.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.workplace.uid];
    this.router.navigate(url, { fragment: 'staff-records' });
  }
}
