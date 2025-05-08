import { UntypedFormBuilder } from '@angular/forms';
import { QuestionComponent } from '../question/question.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
})
export class CareWorkforcePathwayComponent extends QuestionComponent {
  public section = 'Training and qualifications';

  constructor(
      protected formBuilder: UntypedFormBuilder,
      protected router: Router,
      protected route: ActivatedRoute,
      protected backLinkService: BackLinkService,
      protected errorSummaryService: ErrorSummaryService,
      protected workerService: WorkerService,
      protected establishmentService: EstablishmentService,
      private qualificationService: QualificationService,
      private alertService: AlertService,
    ) {
      super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);
}}
