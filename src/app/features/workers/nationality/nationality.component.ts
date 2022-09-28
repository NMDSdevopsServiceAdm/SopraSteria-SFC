import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Nationality } from '@core/model/nationality.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NationalityService } from '@core/services/nationality.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-nationality',
  templateUrl: './nationality.component.html',
})
export class NationalityComponent extends QuestionComponent {
  public availableNationalities: Nationality[];
  public section = 'Personal details';

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private nationalityService: NationalityService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

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
        .subscribe((nationalities) => (this.availableNationalities = nationalities)),
    );
    console.log('**** available nationalities ****');

    console.log(this.availableNationalities);
    this.subscriptions.add(
      this.form.get('nationalityKnown').valueChanges.subscribe((value) => {
        this.form.get('nationalityName').clearValidators();

        if (value === 'Other') {
          this.form.get('nationalityName').setValidators([this.nationalityNameValidator]);
        }

        this.form.get('nationalityName').updateValueAndValidity();
      }),
    );

    if (this.worker.nationality) {
      const { value, other } = this.worker.nationality;

      this.form.patchValue({
        nationalityKnown: value,
        nationalityName: other ? other.nationality : null,
      });
    }

    this.previous = this.getRoutePath('ethnicity');
    this.next = this.getRoutePath('british-citizenship');
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

    if (this.worker && nationalityKnown.value === 'British') {
      this.worker.britishCitizenship = null;
    }

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
    const { nationalityKnown } = this.form.controls;
    nationalityKnown.value === 'British' && (this.next = this.getRoutePath('country-of-birth'));
  }

  nationalityNameValidator() {
    if (this.form && this.availableNationalities) {
      const { nationalityKnown, nationalityName } = this.form.controls;

      if (nationalityKnown.value === 'Other') {
        if (nationalityName.value) {
          const nationalityNameLowerCase = nationalityName.value.toLowerCase();
          return this.availableNationalities.some((n) => n.nationality.toLowerCase() === nationalityNameLowerCase)
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
        .filter((n) => n.nationality.toLowerCase().startsWith(nationalityNameLowerCase))
        .filter((n) => n.nationality.toLowerCase() !== nationalityNameLowerCase)
        .map((n) => n.nationality);
    }

    return [];
  }
}
