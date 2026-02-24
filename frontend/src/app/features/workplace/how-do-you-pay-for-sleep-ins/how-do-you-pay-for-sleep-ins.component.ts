//how-do-you-pay-for-sleep-ins.component.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkplaceQuestion } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-how-do-you-pay-for-sleep-ins',
  templateUrl: './how-do-you-pay-for-sleep-ins.component.html',
  standalone: false,
})
export class HowDoYouPayForSleepInsComponent extends WorkplaceQuestion implements OnInit, OnDestroy {
  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {}
}
