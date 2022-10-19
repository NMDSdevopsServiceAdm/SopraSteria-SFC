import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-mental-health-professional',
  templateUrl: './mental-health-professional.component.html',
})
export class MentalHealthProfessionalComponent extends QuestionComponent implements OnInit, OnDestroy {
  public answersAvailable = ['Yes', 'No', `Don't know`];
  public section = 'Personal details';
  private nationalInsuranceNumberPath: string[];

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
      approvedMentalHealthWorker: null,
    });
  }

  init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    if (this.worker.approvedMentalHealthWorker) {
      this.prefill();
    }
    this.setUpPageRouting();
  }

  private prefill() {
    this.form.patchValue({
      approvedMentalHealthWorker: this.worker.approvedMentalHealthWorker,
    });
  }

  private setUpPageRouting() {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');
    this.nationalInsuranceNumberPath = this.getRoutePath('national-insurance-number');

    if (this.insideFlow) {
      this.previous = this.getRoutePath('main-job-start-date');
      this.skipRoute = this.nationalInsuranceNumberPath;
      this.next = this.nationalInsuranceNumberPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
  }

  generateUpdateProps() {
    const { approvedMentalHealthWorker } = this.form.controls;
    return approvedMentalHealthWorker.value
      ? {
          approvedMentalHealthWorker: approvedMentalHealthWorker.value,
        }
      : null;
  }
}
