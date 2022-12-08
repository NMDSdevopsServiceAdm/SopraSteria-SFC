import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-contract-with-zero-hours',
  templateUrl: './contract-with-zero-hours.component.html',
})
export class ContractWithZeroHoursComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

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

    this.next =
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        ? this.getRoutePath('average-weekly-hours')
        : this.getRoutePath('weekly-contracted-hours');
  }

  generateUpdateProps() {
    const { zeroHoursContract } = this.form.value;

    if (!zeroHoursContract) {
      return null;
    }

    return {
      zeroHoursContract,
    };
  }

  private determineBaseRoute(): string[] {
    if (this.wdfEditPageFlag) {
      return ['wdf', 'staff-record', this.worker.uid];
    }
    if (!this.insideFlow) {
      return this.getRoutePath('');
    } else {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid];
    }
  }

  private determineConditionalRouting(): string[] {
    const nextRoute = this.determineBaseRoute();
    const { zeroHoursContract } = this.form.controls;
    if (
      zeroHoursContract.value === 'Yes' ||
      ([Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract) && this.insideFlow)
    ) {
      nextRoute.push('average-weekly-hours');
    } else if (
      zeroHoursContract.value !== 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    ) {
      nextRoute.push('weekly-contracted-hours');
    }
    return nextRoute;
  }

  onSuccess() {
    this.next = this.determineConditionalRouting();
  }
}
