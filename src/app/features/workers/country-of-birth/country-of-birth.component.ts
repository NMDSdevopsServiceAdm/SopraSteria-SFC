import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { CountryResponse, CountryService } from '@core/services/country.service';
import { MessageService } from '@core/services/message.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-country-of-birth',
  templateUrl: './country-of-birth.component.html',
})
export class CountryOfBirthComponent implements OnInit, OnDestroy {
  public availableOtherCountries: CountryResponse[];
  public backLink: string;
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private countryService: CountryService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.cobNameValidator = this.cobNameValidator.bind(this);
    this.cobNameFilter = this.cobNameFilter.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      cobKnown: null,
      cobName: [null, this.cobNameValidator],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
      this.backLink =
        this.worker.nationality && this.worker.nationality.value === 'British' ? 'nationality' : 'british-citizenship';

      if (this.worker.countryOfBirth) {
        const { value, other } = this.worker.countryOfBirth;

        this.form.patchValue({
          cobKnown: value,
          cobName: other ? other.country : null,
        });
      }
    });

    this.subscriptions.add(this.countryService.getCountries().subscribe(res => (this.availableOtherCountries = res)));

    this.subscriptions.add(
      this.form.controls.cobKnown.valueChanges.subscribe(() => this.form.controls.cobName.reset())
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      const { cobKnown } = this.form.value;

      if (cobKnown === 'United Kingdom') {
        this.router.navigate(['/worker', this.worker.uid, 'recruited-from']);
      } else {
        this.router.navigate(['/worker', this.worker.uid, 'year-arrived-uk']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { cobName, cobKnown } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          ...(cobKnown && {
            countryOfBirth: {
              value: cobKnown.value,
              ...(cobName.value && {
                other: {
                  country: cobName.value,
                },
              }),
            },
          }),
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (cobName.errors.validCob) {
          this.messageService.show('error', 'Invalid country of birth.');
        }

        reject();
      }
    });
  }

  cobNameValidator() {
    if (this.form && this.availableOtherCountries) {
      const { cobKnown } = this.form.value;
      const cobName = this.form.controls.cobName.value;

      if (cobKnown === 'Other') {
        if (cobName) {
          const cobNameLowerCase = cobName.toLowerCase();
          return this.availableOtherCountries.some(c => c.country.toLowerCase() === cobNameLowerCase)
            ? null
            : { validCob: true };
        }
      }
    }

    return null;
  }

  cobNameFilter(): string[] {
    const { cobName } = this.form.value;

    if (this.availableOtherCountries && cobName && cobName.length) {
      const cobNameLowerCase = cobName.toLowerCase();
      return this.availableOtherCountries
        .filter(c => c.country.toLowerCase().startsWith(cobNameLowerCase))
        .filter(c => c.country.toLowerCase() !== cobNameLowerCase)
        .map(c => c.country);
    }

    return [];
  }
}
