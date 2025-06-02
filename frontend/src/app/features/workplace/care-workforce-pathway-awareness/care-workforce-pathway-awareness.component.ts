import { Component } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-care-workforce-pathway-awareness',
  templateUrl: './care-workforce-pathway-awareness.component.html',
})
export class CareWorkforcePathwayAwarenessComponent extends Question {
  constructor(
      protected formBuilder: UntypedFormBuilder,
      protected router: Router,
      protected backService: BackService,
      protected errorSummaryService: ErrorSummaryService,
      protected establishmentService: EstablishmentService,
    ) {
      super(formBuilder, router, backService, errorSummaryService, establishmentService);
    }
}

