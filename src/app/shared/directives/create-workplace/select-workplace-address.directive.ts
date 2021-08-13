import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { compact, isEqual } from 'lodash';
import { Subscription } from 'rxjs';

@Directive()
export class SelectWorkplaceAddressDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public flow: string;
  public enteredPostcode: string;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public locationAddresses: Array<LocationAddress>;
  public submitted = false;
  public createAccountNewDesign: boolean;
  public returnToConfirmDetails: URLStructure;
  public selectedLocationAddress: LocationAddress;
  protected subscriptions: Subscription = new Subscription();
  protected errorMessage: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  get getAddress(): AbstractControl {
    return this.form.get('address');
  }

  ngOnInit(): void {
    this.setErrorMessage();
    this.setupForm();
    this.setupFormErrorsMap();
    this.init();
    this.setLocationAddresses();
    this.setSelectedLocationAddress();
    this.prefillForm();
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
    });
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  protected setBackLink(): void {
    const backLink = this.createAccountNewDesign ? 'find-workplace-address' : 'regulated-by-cqc';
    this.backService.setBackLink({ url: [this.flow, backLink] });
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      address: [
        '',
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'address',
        type: [
          {
            name: 'required',
            message: this.errorMessage,
          },
        ],
      },
    ];
  }

  protected setErrorMessage(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  public onLocationChange(index): void {
    const selectedAddress = this.locationAddresses[index];
    // make copy of selectedAddress to avoid name getting added to address in locationAddresses array when name added on workplace-name page
    const selectedAddressCopy = Object.assign({}, selectedAddress);

    this.workplaceInterfaceService.selectedLocationAddress$.next(selectedAddressCopy);
  }

  protected setLocationAddresses(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        this.enteredPostcode = locationAddresses[0].postalCode;
        this.locationAddresses = locationAddresses;
      }),
    );
  }

  protected setSelectedLocationAddress(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress),
      ),
    );
  }

  protected prefillForm(): void {
    if (this.indexOfSelectedLocationAddress() >= 0) {
      this.form.patchValue({
        address: this.indexOfSelectedLocationAddress(),
      });
    }
  }

  protected indexOfSelectedLocationAddress(): number {
    return this.locationAddresses.findIndex((address) => {
      return isEqual(address, this.selectedLocationAddress);
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextRoute(this.selectedLocationAddress.locationName);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected navigateToNextRoute(locationName: string): void {
    if (this.returnToConfirmDetails) {
      this.navigateToConfirmDetails();
      return;
    }

    if (this.createAccountNewDesign) {
      if (locationName?.length) {
        this.router.navigate([`${this.flow}/new-select-main-service`]);
      } else {
        this.router.navigate([`${this.flow}/workplace-name`]);
      }
    } else {
      if (locationName?.length) {
        this.router.navigate([`${this.flow}/select-main-service`]);
      } else {
        this.router.navigate([`${this.flow}/workplace-name-address`]);
      }
    }
  }

  public getLocationName(location: LocationAddress): string {
    const address = [
      location.locationName,
      location.addressLine1,
      location.addressLine2,
      location.addressLine3,
      location.townCity,
      location.postalCode,
    ];
    return compact(address).join(', ');
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected navigateToConfirmDetails(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
