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

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      employerType: ['', Validators.required],
    });
  }

  protected init(): void {
    if (this.establishment.employerType) {
      this.form.patchValue({
        employerType: this.establishment.employerType,
      });
    }

    this.next = ['/workplace', `${this.establishment.id}`, 'select-other-services'];
    this.previous = ['/workplace', 'start-screen'];
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
    ];
  }

  generateUpdateProps() {
    const { employerType } = this.form.value;

    return employerType
      ? {
          employerType,
        }
      : null;
  }

  updateEstablishment(props, action) {
    this.subscriptions.add(
      this.establishmentService
        .postEmployerType(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data, action), error => this.onError(error))
    );
  }
}
