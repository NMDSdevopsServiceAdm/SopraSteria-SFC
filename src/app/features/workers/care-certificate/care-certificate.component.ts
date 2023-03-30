import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

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
