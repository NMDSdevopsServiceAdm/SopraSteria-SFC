import { Component } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NIN_PATTERN } from '@core/constants/constants';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-national-insurance-number',
  templateUrl: './national-insurance-number.component.html',
})
export class NationalInsuranceNumberComponent extends QuestionComponent {
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
      nationalInsuranceNumber: [null, this.ninValidator],
    });
  }

  init() {
    if (this.worker.nationalInsuranceNumber) {
      this.form.patchValue({
        nationalInsuranceNumber: this.worker.nationalInsuranceNumber,
      });
    }

    this.next = this.getRoutePath('date-of-birth');
    this.previous = this.getRoutePath('flu-jab');
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nationalInsuranceNumber',
        type: [
          {
            name: 'validNin',
            message: 'Enter a National Insurance number in the correct format',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { nationalInsuranceNumber } = this.form.controls;

    return nationalInsuranceNumber.value
      ? {
          nationalInsuranceNumber: nationalInsuranceNumber.value.toUpperCase(),
        }
      : {nationalInsuranceNumber: null};
  }

  ninValidator(control: AbstractControl) {
    return !control.value || NIN_PATTERN.test(control.value.toUpperCase()) ? null : { validNin: true };
  }
}
