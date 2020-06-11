import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-mandatory-details',
  templateUrl: './mandatory-details.component.html',
})
export class MandatoryDetailsComponent extends QuestionComponent implements OnInit, OnDestroy {
  public subscriptions: Subscription = new Subscription();

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

  ngOnInit() {
    // this.next = this.getRoutePath('gender');
    // this.previous = this.getRoutePath('date-of-birth');

    // this.subscriptions.add(
    //   this.workerService.alert$.subscribe(alert => {
    //     if (alert) {
    //       this.alertService.addAlert(alert);
    //     }
    //   })
    // );
  }


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
