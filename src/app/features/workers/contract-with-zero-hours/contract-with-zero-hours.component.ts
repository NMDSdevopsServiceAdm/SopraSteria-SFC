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

  onSuccess() {
    const { zeroHoursContract } = this.form.controls;
    if (!this.insideFlow) {
      const staffSummaryUrl = this.getRoutePath('');
      zeroHoursContract.value === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
        ? staffSummaryUrl.push('average-weekly-hours')
        : staffSummaryUrl.push('weekly-contracted-hours');
      this.next = staffSummaryUrl;
    }
  }
}
