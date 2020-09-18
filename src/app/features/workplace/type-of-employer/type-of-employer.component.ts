import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: './type-of-employer.component.html',
})
export class TypeOfEmployerComponent extends Question {
  public options = [
    'Local Authority (adult services)',
    'Local Authority (generic/other)',
    'Private Sector',
    'Voluntary / Charity',
    'Other',
  ];
  public maxLength = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      employerType: ['', Validators.required],
      other: [null, Validators.maxLength(this.maxLength)],
    });
  }

  protected init(): void {
    if (this.establishment.employerType) {
      this.form.patchValue({
        employerType: this.establishment.employerType.value,
        other: this.establishment.employerType.other,
      });
    }

    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'other-services'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'start'];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'employerType',
        type: [
          {
            name: 'required',
            message: 'Please select an Employer type',
          },
        ],
      },
      {
        item: 'other',
        type: [
          {
            name: 'maxlength',
            message: `Other Employer type must be ${this.maxLength} characters or less`,
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { employerType, other } = this.form.value;

    return employerType
      ? {
          employerType: {
            value: employerType,
            ...(employerType === 'Other' && {
              other,
            }),
          },
        }
      : null;
  }

  updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService.updateTypeOfEmployer(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }
}
