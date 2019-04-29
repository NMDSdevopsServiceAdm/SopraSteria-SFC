import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { filter } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent implements OnInit, OnDestroy {
  private locationAddresses: Array<LocationAddress>;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();

    this.subscriptions.add(
      this.registrationService.locationAddresses$.subscribe(
        (locationAddresses: Array<LocationAddress>) => this.locationAddresses = locationAddresses
      )
    );
  }

  private setupForm(): void {
    this.form = this.fb.group({
      workplace: ['', Validators.required],
    });
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplace',
        type: [
          {
            name: 'required',
            message: 'Please select an address.',
          },
        ],
      },
    ];
  }

  private getSelectedLocation(): LocationAddress {
    const selectedLocationId: string = this.form.get('workplace').value;
    return filter(this.locationAddresses, ['locationId', selectedLocationId])[0];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private save(): void {
    this.registrationService.selectedLocationAddress$.next(this.getSelectedLocation());
    this.router.navigate(['/registration/select-main-service']);
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/regulated-by-cqc'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
