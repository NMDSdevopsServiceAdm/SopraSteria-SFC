import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { CountryResponse, CountryService } from '@core/services/country.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
    public route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private countryService: CountryService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.countryOfBirthNameValidator = this.countryOfBirthNameValidator.bind(this);
    this.countryOfBirthNameFilter = this.countryOfBirthNameFilter.bind(this);

    this.form = this.formBuilder.group({
      countryOfBirthKnown: null,
      countryOfBirthName: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
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
      this.prefill();
    }

    this.next = this.getRoutePath('year-arrived-uk');
  }

  private prefill(): void {
    const { value, other } = this.worker.countryOfBirth;
    this.form.patchValue({
      countryOfBirthKnown: value,
      countryOfBirthName: other ? other.country : null,
    });
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'countryOfBirthName',
        type: [
          {
            name: 'validCountryOfBirth',
            message: 'Enter a valid country',
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
    const { countryOfBirthKnown } = this.form.controls;
    if (countryOfBirthKnown.value === 'United Kingdom') {
      this.next = this.insideFlow ? this.getRoutePath('main-job-start-date') : this.getRoutePath('');
    } else {
      if (!this.insideFlow) {
        this.next = this.getRoutePath('');
        this.next.push('year-arrived-uk');
      }
    }
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
