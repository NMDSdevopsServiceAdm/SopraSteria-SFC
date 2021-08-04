import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { compact } from 'lodash';
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
  public workplaceNotListedLink: string;
  public returnToConfirmDetails: URLStructure;
  protected selectedLocationAddress: LocationAddress;
  protected subscriptions: Subscription = new Subscription();

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {}

  get getAddress(): AbstractControl {
    return this.form.get('address');
  }

  ngOnInit(): void {
    this.setupForm();
    this.setupFormErrorsMap();
    this.init();
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
      this.workplaceNotListedLink = value ? 'workplace-address' : 'workplace-name-address';
    });
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

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

  protected setupFormErrorsMap(): void {}

  public onLocationChange(addressLine1: string): void {}

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.navigateToNextRoute();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected navigateToNextRoute(): void {
    const url = this.getNextRoute();
    this.router.navigate([this.flow, url]);
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
  protected getNextRoute(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
