import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { StringChain } from 'lodash';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: './type-of-employer.component.html',
})
export class TypeOfEmployerComponent extends Question {
  public options = [
    { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
    { value: 'Local Authority (generic/other)', text: 'Local authority (generic, other)' },
    { value: 'Private Sector', text: 'Private sector' },
    { value: 'Voluntary / Charity', text: 'Voluntary, charity, not for profit' },
    { value: 'Other', text: 'Other' },
  ];
  public maxLength = 120;
  public showSkipButton = true;
  public sectionHeading: string;
  public callToAction = 'Save and continue';

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group(
      {
        employerType: ['', Validators.required],
        other: [null, Validators.maxLength(this.maxLength)],
      },
      { updateOn: 'submit' },
    );
  }

  protected init(): void {
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'other-services'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'start'];

    if (this.establishmentService.employerTypeHasValue === false) {
      this.sectionHeading = this.establishment.name;
      this.callToAction = 'Continue to homepage';
      this.hideBackLink = true;
      this.showSkipButton = false;
      this.nextRoute = ['/first-login-wizard'];
    }

    if (this.establishment.employerType) {
      this.form.patchValue({
        employerType: this.establishment.employerType.value,
        other: this.establishment.employerType.other,
      });
    }
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'employerType',
        type: [
          {
            name: 'required',
            message: 'Select the type of employer',
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

  updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.updateTypeOfEmployer(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }
}
