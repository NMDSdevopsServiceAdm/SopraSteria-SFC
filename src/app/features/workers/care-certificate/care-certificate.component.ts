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
  selector: 'app-care-certificate',
  templateUrl: './care-certificate.component.html',
})
export class CareCertificateComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes, completed', tag: 'Yes, completed' },
    { value: 'Yes, in progress or partially completed', tag: 'Yes, started or partially completed' },
    { value: 'No', tag: 'No' },
  ];
  public section = 'Training and qualifications';
  private apprenticeshipTrainingPath: string[];

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
      careCertificate: null,
    });
  }

  init() {
    this.next = this.getRoutePath('apprenticeship-training');
    if (this.worker.careCertificate) {
      this.prefill();
    }
  }

  private prefill() {
    this.form.patchValue({
      careCertificate: this.worker.careCertificate,
    });
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
