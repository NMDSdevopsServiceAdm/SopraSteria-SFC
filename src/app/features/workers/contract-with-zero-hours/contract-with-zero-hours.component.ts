import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-contract-with-zero-hours',
  templateUrl: './contract-with-zero-hours.component.html',
})
export class ContractWithZeroHoursComponent extends QuestionComponent {
  public answersAvailable = ['Yes', 'No', `Don't know`];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      zeroHoursContract: null,
    });
  }

  init() {
    if (this.worker.zeroHoursContract) {
      this.form.patchValue({
        zeroHoursContract: this.worker.zeroHoursContract,
      });
    }

    this.previous = [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)
      ? this.getRoutePath('days-of-sickness')
      : this.getRoutePath('adult-social-care-started');
  }

  generateUpdateProps() {
    const { zeroHoursContract } = this.form.value;

    if (!zeroHoursContract) {
      return null;
    }

    return {
      zeroHoursContract: zeroHoursContract,
    };
  }

  onSuccess() {
    this.next =
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        ? this.getRoutePath('average-weekly-hours')
        : this.getRoutePath('weekly-contracted-hours');
  }
}
