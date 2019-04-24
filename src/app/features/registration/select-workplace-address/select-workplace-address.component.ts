import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationAddress, LocationSearchResponse } from '@core/model/location.model';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
  private serverError: string;
  private serverErrorsMap: Array<ErrorDefinition>;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();
  private editPostcode = false;

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

  get getPostcode() {
    return this.form.get('postcode');
  }

  ngOnInit() {
    // TODO remove
    this.registrationService.selectedLocationAddress$.next({
      addressLine1: '14A',
      addressLine2: 'DUKE ROAD',
      county: 'REDBRIDGE',
      locationName: '',
      postalCode: 'IG6 1NQ',
      townCity: 'ILFORD',
    });
    // TODO remove

    this.setupForm();
    this.setupSubscriptions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      address: ['', [Validators.required]],
      postcode: '',
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
      },
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Please enter a postcode.',
          },
          {
            name: 'maxlength',
            message: 'Invalid postcode.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'No results found.',
      },
      {
        name: 404,
        message: 'Invalid postcode.',
      },
      {
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/regulated-by-cqc'] });
  }

  private changePostcode(): void {
    this.editPostcode = true;
    this.getPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    this.getPostcode.updateValueAndValidity();

    if (this.getAddress.valid) {
      this.getAddressesByPostCode();
    } else {
      this.onSubmit();
    }
  }

  private getAddressesByPostCode(): void {
    this.subscriptions.add(
      this.registrationService.getAddressesByPostCode(this.getPostcode.value).subscribe(
        (data: LocationSearchResponse) => {
          this.registrationService.locationAddresses$.next(data.postcodedata);
          this.editPostcode = false;
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  private onAddressChange($event: LocationAddress): void {
    this.registrationService.selectedLocationAddress$.next($event);
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
