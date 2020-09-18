import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { CountryResponse, CountryService } from '@core/services/country.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-country-of-birth',
  templateUrl: './country-of-birth.component.html',
})
export class CountryOfBirthComponent extends QuestionComponent {
  public availableCountries: CountryResponse[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private countryService: CountryService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.countryOfBirthNameValidator = this.countryOfBirthNameValidator.bind(this);
    this.countryOfBirthNameFilter = this.countryOfBirthNameFilter.bind(this);

    this.form = this.formBuilder.group({
      countryOfBirthKnown: null,
      countryOfBirthName: null,
    });
  }

  init() {
    this.subscriptions.add(this.countryService.getCountries().subscribe((res) => (this.availableCountries = res)));

    this.subscriptions.add(
      this.form.get('countryOfBirthKnown').valueChanges.subscribe((value) => {
        this.form.get('countryOfBirthName').clearValidators();

        if (value === 'Other') {
          this.form.get('countryOfBirthName').setValidators([this.countryOfBirthNameValidator]);
        }

        this.form.get('countryOfBirthName').updateValueAndValidity();
      }),
    );

    if (this.worker.countryOfBirth) {
      const { value, other } = this.worker.countryOfBirth;

      this.form.patchValue({
        countryOfBirthKnown: value,
        countryOfBirthName: other ? other.country : null,
      });
    }

    this.previous =
      this.worker.nationality && this.worker.nationality.value === 'British'
        ? this.getRoutePath('nationality')
        : this.getRoutePath('british-citizenship');
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'countryOfBirthName',
        type: [
          {
            name: 'validCountryOfBirth',
            message: 'Invalid country of birth.',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { countryOfBirthName, countryOfBirthKnown } = this.form.value;

    return countryOfBirthKnown
      ? {
          countryOfBirth: {
            value: countryOfBirthKnown,
            ...(countryOfBirthName && {
              other: {
                country: countryOfBirthName,
              },
            }),
          },
        }
      : null;
  }

  onSuccess() {
    this.next =
      this.worker.countryOfBirth && this.worker.countryOfBirth.value === 'United Kingdom'
        ? this.getRoutePath('recruited-from')
        : this.getRoutePath('year-arrived-uk');
  }

  countryOfBirthNameValidator() {
    if (this.form && this.availableCountries) {
      const { countryOfBirthKnown, countryOfBirthName } = this.form.controls;

      if (countryOfBirthKnown.value === 'Other') {
        if (countryOfBirthName.value) {
          const countryOfBirthNameLowerCase = countryOfBirthName.value.toLowerCase();
          return this.availableCountries.some((c) => c.country.toLowerCase() === countryOfBirthNameLowerCase)
            ? null
            : { validCountryOfBirth: true };
        }
      }
    }

    return null;
  }

  countryOfBirthNameFilter(): string[] {
    const { countryOfBirthName } = this.form.controls;

    if (this.availableCountries && countryOfBirthName.value && countryOfBirthName.value.length) {
      const countryOfBirthNameLowerCase = countryOfBirthName.value.toLowerCase();
      return this.availableCountries
        .filter((c) => c.country.toLowerCase().startsWith(countryOfBirthNameLowerCase))
        .filter((c) => c.country.toLowerCase() !== countryOfBirthNameLowerCase)
        .map((c) => c.country);
    }

    return [];
  }
}
