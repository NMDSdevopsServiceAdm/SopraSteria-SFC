import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-enter-workplace-address',
  templateUrl: './enter-workplace-address.component.html',
})
export class EnterWorkplaceAddressComponent implements OnInit, OnDestroy {
  private addressMaxLength = 40;
  private formErrorsMap: Array<ErrorDetails>;
  private postcodeMaxLength = 8;
  private subscriptions: Subscription = new Subscription();
  private workplaceNameMaxLength = 120;
  public form: FormGroup;
  public submitted = false;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Get postcode
  get getPostcode() {
    return this.form.get('postcode');
  }

  // Get address 1
  get getAddress1() {
    return this.form.get('address1');
  }

  // Get address 2
  get getAddress2() {
    return this.form.get('address2');
  }

  // Get town/city
  get getTownCity() {
    return this.form.get('townOrCity');
  }

  // Get county
  get getCounty() {
    return this.form.get('county');
  }

  // Get workplace name
  get getWorkplaceName() {
    return this.form.get('workplaceName');
  }

  ngOnInit() {
    this.setupForm();
    this.setupSubscription();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.fb.group({
      address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      address2: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      county: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength)]],
      townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      workplaceName: ['', [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)]],
    });
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe((selectedLocation: LocationAddress) => {
        if (selectedLocation) {
          this.preFillForm(selectedLocation);
        }
      })
    );
  }

  private preFillForm(selectedLocation: LocationAddress): void {
    this.form.setValue({
      address1: selectedLocation.addressLine1,
      address2: selectedLocation.addressLine2,
      county: selectedLocation.county,
      postcode: selectedLocation.postalCode,
      townOrCity: selectedLocation.townCity,
      workplaceName: selectedLocation.locationName,
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'address1',
        type: [
          {
            name: 'required',
            message: 'Please enter your address.',
          },
          {
            name: 'maxlength',
            message: `'Your address must be no longer than ${this.addressMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'address2',
        type: [
          {
            name: 'required',
            message: 'Please enter your address.',
          },
          {
            name: 'maxlength',
            message: `'Your address must be no longer than ${this.addressMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'county',
        type: [
          {
            name: 'required',
            message: 'Please enter your county.',
          },
          {
            name: 'maxlength',
            message: `'Your county must be no longer than ${this.addressMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Please enter your postcode.',
          },
          {
            name: 'maxlength',
            message: `Your postcode must be no longer than ${this.postcodeMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'townOrCity',
        type: [
          {
            name: 'required',
            message: 'Please enter your town or city.',
          },
          {
            name: 'maxlength',
            message: `'Your town or city must be no longer than ${this.addressMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'workplaceName',
        type: [
          {
            name: 'required',
            message: 'Please enter your workplace name.',
          },
          {
            name: 'maxlength',
            message: `Your workplace name must be no longer than ${this.workplaceNameMaxLength} characters.`,
          },
        ],
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.setSelectedLocationAddress();
      this.router.navigate(['/registration/select-main-service']);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setSelectedLocationAddress(): void {
    this.registrationService.selectedLocationAddress$.next({
      addressLine1: this.getAddress1.value,
      addressLine2: this.getAddress2.value,
      county: this.getCounty.value,
      locationName: this.getWorkplaceName.value,
      postalCode: this.getPostcode.value,
      townCity: this.getTownCity.value,
    });
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

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/select-workplace-address'] });
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
