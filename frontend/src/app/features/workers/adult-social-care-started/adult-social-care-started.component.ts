import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { Contracts } from '@core/model/contracts.enum';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-adult-social-care-started',
  templateUrl: './adult-social-care-started.component.html',
})
export class AdultSocialCareStartedComponent extends QuestionComponent {
  public intPattern = INT_PATTERN.toString();

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

    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);

    this.form = this.formBuilder.group({
      yearKnown: null,
      year: null,
    });
  }

  init(): void {
    this.subscriptions.add(
      this.form.get('yearKnown').valueChanges.subscribe((value) => {
        this.form.get('year').clearValidators();

        if (value === 'Yes') {
          this.form
            .get('year')
            .setValidators([
              Validators.required,
              Validators.min(dayjs().subtract(100, 'years').year()),
              Validators.max(dayjs().year()),
            ]);
        }

        this.form.get('year').updateValueAndValidity();
      }),
    );

    if (this.worker.socialCareStartDate) {
      this.form.patchValue({
        yearKnown: this.worker.socialCareStartDate.value,
        year: this.worker.socialCareStartDate.year ? this.worker.socialCareStartDate.year : null,
      });
    }

    this.next = [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract)
      ? this.getRoutePath('days-of-sickness')
      : this.getRoutePath('contract-with-zero-hours');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'year',
        type: [
          {
            name: 'required',
            message: 'Enter the year',
          },
          {
            name: 'min',
            message: `Year cannot be more than 100 years ago`,
          },
          {
            name: 'max',
            message: `Year cannot be in the future`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { yearKnown, year } = this.form.value;

    if (!yearKnown) {
      return null;
    }

    return {
      socialCareStartDate: {
        value: yearKnown,
        year,
      },
    };
  }
}
