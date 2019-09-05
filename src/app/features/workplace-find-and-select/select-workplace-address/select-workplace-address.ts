import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { compact } from 'lodash';
import { Subscription } from 'rxjs';

export class SelectWorkplaceAddress implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected flow: string;
  protected selectedLocationAddress: LocationAddress;
  protected subscriptions: Subscription = new Subscription();
  public enteredPostcode: string;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public locationAddresses: Array<LocationAddress>;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {}

  get getAddress() {
    return this.form.get('address');
  }

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.init();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/regulated-by-cqc`] });
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      address: ['', [Validators.required]],
    });
  }

  protected setupFormErrorsMap(): void {
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
    ];
  }

  public onLocationChange(addressLine1: string): void {}

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
    if (!locationName.length) {
      this.router.navigate([`${this.flow}/enter-workplace-address`]);
    } else {
      this.router.navigate([`${this.flow}/select-main-service`]);
    }
  }

  public getLocationName(location: LocationAddress): string {
    const address = [
      location.locationName,
      location.addressLine1,
      location.addressLine2,
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
