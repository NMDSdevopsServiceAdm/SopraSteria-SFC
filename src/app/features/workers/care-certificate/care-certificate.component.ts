import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-care-certificate',
  templateUrl: './care-certificate.component.html',
})
export class CareCertificateComponent extends QuestionComponent {
  public answersAvailable = ['Yes, completed', 'Yes, in progress or partially completed', 'No'];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      careCertificate: null,
    });
  }

  init() {
    if (this.worker.careCertificate) {
      this.form.patchValue({
        careCertificate: this.worker.careCertificate,
      });
    }

    this.next = this.getRoutePath('apprenticeship-training');
    this.previous = this.getRoutePath('salary');
  }

  generateUpdateProps() {
    const { careCertificate } = this.form.value;

    if (!careCertificate) {
      return null;
    }

    return {
      careCertificate,
    };
  }
}
