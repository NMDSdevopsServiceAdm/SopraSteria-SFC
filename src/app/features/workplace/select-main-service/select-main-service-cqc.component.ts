import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-select-main-service-cqc',
  templateUrl: './select-main-service-cqc.component.html',
})
export class SelectMainServiceCqcComponent extends Question {
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      cqc: ['', Validators.required],
    });

    this.formErrorsMap = [
      {
        item: 'cqc',
        type: [
          {
            name: 'required',
            message: 'Select Yes if your new main service is regulated by the CQC.',
          },
        ],
      },
    ];

    this.form.get('cqc'); // If it's stupid but it works, it isn't stupid.
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.establishmentService.mainServiceCQC = this.form.get('cqc').value;
      this.router.navigate(['/workplace', this.establishmentService.establishmentId, 'main-service'])
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

}
