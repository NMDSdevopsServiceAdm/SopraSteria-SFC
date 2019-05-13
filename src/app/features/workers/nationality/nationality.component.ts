import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Nationality } from '@core/model/nationality.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { NationalityService } from '@core/services/nationality.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nationality',
  templateUrl: './nationality.component.html',
})
export class NationalityComponent extends QuestionComponent {
  public availableNationalities: Nationality[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private nationalityService: NationalityService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.nationalityNameValidator = this.nationalityNameValidator.bind(this);
    this.nationalityNameFilter = this.nationalityNameFilter.bind(this);

    this.form = this.formBuilder.group({
      nationalityKnown: null,
      nationalityName: null,
    });
  }

  init() {
    this.subscriptions.add(
      this.nationalityService
        .getNationalities()
        .subscribe(nationalities => (this.availableNationalities = nationalities))
    );

    this.subscriptions.add(
      this.form.get('nationalityKnown').valueChanges.subscribe(value => {
        this.form.get('nationalityName').clearValidators();

        if (value === 'Other') {
          this.form.get('nationalityName').setValidators([this.nationalityNameValidator]);
        }

        this.form.get('nationalityName').updateValueAndValidity();
      })
    );

    if (this.worker.nationality) {
      const { value, other } = this.worker.nationality;

      this.form.patchValue({
        nationalityKnown: value,
        nationalityName: other ? other.nationality : null,
      });
    }

    this.previous = ['/worker', this.worker.uid, 'ethnicity'];
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'nationalityName',
        type: [
          {
            name: 'validNationality',
            message: 'Invalid nationality.',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { nationalityName, nationalityKnown } = this.form.controls;

    return nationalityKnown.value
      ? {
          nationality: {
            value: nationalityKnown.value,
            ...(nationalityName.value && {
              other: {
                nationality: nationalityName.value,
              },
            }),
          },
        }
      : null;
  }

  onSuccess() {
    const { nationalityKnown } = this.form.value;

    this.next =
      nationalityKnown === 'British'
        ? ['/worker', this.worker.uid, 'country-of-birth']
        : ['/worker', this.worker.uid, 'british-citizenship'];
  }

  nationalityNameValidator() {
    if (this.form && this.availableNationalities) {
      const { nationalityKnown, nationalityName } = this.form.controls;

      if (nationalityKnown.value === 'Other') {
        if (nationalityName.value) {
          const nationalityNameLowerCase = nationalityName.value.toLowerCase();
          return this.availableNationalities.some(n => n.nationality.toLowerCase() === nationalityNameLowerCase)
            ? null
            : { validNationality: true };
        }
      }
    }

    return null;
  }

  nationalityNameFilter(): string[] {
    const { nationalityName } = this.form.value;

    if (this.availableNationalities && nationalityName && nationalityName.length) {
      const nationalityNameLowerCase = nationalityName.toLowerCase();
      return this.availableNationalities
        .filter(n => n.nationality.toLowerCase().startsWith(nationalityNameLowerCase))
        .filter(n => n.nationality.toLowerCase() !== nationalityNameLowerCase)
        .map(n => n.nationality);
    }

    return [];
  }
}
