import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { NationalityResponse, NationalityService } from '@core/services/nationality.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-nationality',
  templateUrl: './nationality.component.html',
})
export class NationalityComponent implements OnInit, OnDestroy {
  public availableOtherNationalities: NationalityResponse[];
  public form: FormGroup;
  private subscriptions = [];
  private worker: Worker;
  private workerId: string;

  constructor(
    private workerService: WorkerService,
    private nationalityService: NationalityService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.saveHandler = this.saveHandler.bind(this);
    this.nationalityNameValidator = this.nationalityNameValidator.bind(this);
    this.nationalityNameFilter = this.nationalityNameFilter.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      nationalityKnown: null,
      nationalityName: [null, this.nationalityNameValidator],
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.nationality) {
          const { value, other } = worker.nationality;

          this.form.patchValue({
            nationalityKnown: value,
            nationalityName: other ? other.nationality : null,
          });
        }
      }),
    );

    this.subscriptions.push(
      this.nationalityService.getNationalities().subscribe(res => (this.availableOtherNationalities = res)),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      if (this.worker.nationality && this.worker.nationality.value === 'British') {
        this.router.navigate(['/worker/country-of-birth']);
      } else {
        this.router.navigate(['/worker/british-citizenship']);
      }
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { nationalityName, nationalityKnown } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        if (nationalityKnown.value) {
          this.worker.nationality = { value: nationalityKnown.value };

          if (nationalityName.value) {
            this.worker.nationality.other = {
              nationality: `${nationalityName.value.charAt(0).toUpperCase()}${nationalityName.value.slice(1)}`,
            };
          }
        }

        this.subscriptions.push(this.workerService.setWorker(this.worker).subscribe(resolve, reject));
      } else {
        if (nationalityName.errors) {
          if (Object.keys(nationalityName.errors).includes('required')) {
            this.messageService.show('error', 'Nationality must be provided.');
          } else if (Object.keys(nationalityName.errors).includes('validNationality')) {
            this.messageService.show('error', 'Invalid nationality.');
          }
        }

        reject();
      }
    });
  }

  nationalityKnownChangeHandler() {
    this.form.controls.nationalityName.reset();
  }

  nationalityNameValidator() {
    if (this.form && this.availableOtherNationalities) {
      const { nationalityKnown } = this.form.value;
      const nationalityName = this.form.controls.nationalityName.value;

      if (nationalityKnown === 'Other') {
        if (nationalityName) {
          const nationalityNameLowerCase = nationalityName.toLowerCase();
          return this.availableOtherNationalities.some(n => n.nationality.toLowerCase() === nationalityNameLowerCase)
            ? null
            : { validNationality: true };
        } else {
          return { required: true };
        }
      }
    }

    return null;
  }

  nationalityNameFilter(): string[] {
    const { nationalityName } = this.form.value;

    if (this.availableOtherNationalities && nationalityName && nationalityName.length) {
      const nationalityNameLowerCase = nationalityName.toLowerCase();
      return this.availableOtherNationalities
        .filter(n => n.nationality.toLowerCase().startsWith(nationalityNameLowerCase))
        .filter(n => n.nationality.toLowerCase() !== nationalityNameLowerCase)
        .map(n => n.nationality);
    }

    return [];
  }
}
