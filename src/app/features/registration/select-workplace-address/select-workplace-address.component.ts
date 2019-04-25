import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocationAddress } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'lodash';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
})
export class SelectWorkplaceAddressComponent implements OnInit, OnDestroy {
  private enteredPostcode: string;
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private locationAddresses: Array<LocationAddress>;
  private selectedLocationAddress: LocationAddress;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  get getAddress() {
    return this.form.get('address');
  }

  ngOnInit() {
    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      address: ['', [Validators.required]],
    });
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.registrationService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      })
    );

    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => this.selectedLocationAddress = locationAddress
      )
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'address',
        type: [
          {
            name: 'required',
            message: 'Please select an address.',
          },
        ],
      }
    ];
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/regulated-by-cqc'] });
  }

  private onLocationChange(addressLine1: string): void {
    const selectedLocation: LocationAddress = filter(this.locationAddresses, ['addressLine1', addressLine1])[0];
    this.registrationService.selectedLocationAddress$.next(selectedLocation);
  }

  private onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextRoute(this.selectedLocationAddress.locationName);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private navigateToNextRoute(locationName: string): void {
    if (!locationName.length) {
      this.router.navigate(['/registration/enter-workplace-address']);
    } else {
      this.router.navigate(['/registration/select-main-service']);
    }
  }

  private getLocationName(location: LocationAddress): string {
    let name: string = location.locationName.length ? `${location.locationName}, ` : '';
    name += `${location.addressLine1}, ${location.addressLine2} - ${location.townCity} ${location.postalCode}`;
    return name;
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
