import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-recruitment-advertising-cost',
  templateUrl: './recruitment-advertising-cost.component.html',
})
export class RecruitmentAdvertisingCostComponent extends Question implements OnInit, OnDestroy {
  public amountSpentKnownOptions = [
    {
      label: 'Nothing has been spent on advertising for staff in the last 4 weeks',
      value: 'None',
    },
    {
      label: 'I do not know how much has been spent on advertising for staff',
      value: 'Unknown',
    },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      amountSpent: ['', [Validators.required]],
      amountSpentKnown: null,
    });
  }
}
