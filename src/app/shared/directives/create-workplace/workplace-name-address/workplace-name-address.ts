/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';
import { Subscription } from 'rxjs';

@Directive()
export class WorkplaceNameAddressDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public isWorkPlaceUpdate: boolean;
  public form: FormGroup;
  public formControlsMap: any[];
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public title: string;
  public workplaceErrorMessage: string;
  public returnToConfirmDetails: URLStructure;
  public returnToWorkplaceNotFound: boolean;
  public isCqcRegulated: boolean;
  public manuallyEnteredWorkplace: boolean;
  public flow: string;
  protected workplaceNameMaxLength = 120;
  protected addressMaxLength = 40;
  protected postcodeMaxLength = 8;
  protected subscriptions: Subscription = new Subscription();
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;

  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  get getWorkplaceName() {
    return this.form.get('workplaceName');
  }

  get getAddress1() {
    return this.form.get('address1');
  }

  get getAddress2() {
    return this.form.get('address2');
  }

  get getAddress3() {
    return this.form.get('address3');
  }

  get getTownCity() {
    return this.form.get('townOrCity');
  }

  get getCounty() {
    return this.form.get('county');
  }

  get getPostcode() {
    return this.form.get('postcode');
  }

  ngOnInit(): void {
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.setupFormControlsMap();
    this.setFlow();
    this.setTitle();
    this.setErrorMessage();
    this.init();
    this.setBackLink();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: [
        '',
        { validators: [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)], updateOn: 'submit' },
      ],
      address1: [
        '',
        { validators: [Validators.required, Validators.maxLength(this.addressMaxLength)], updateOn: 'submit' },
      ],
      address2: ['', { validators: [Validators.maxLength(this.addressMaxLength)], updateOn: 'submit' }],
      address3: ['', { validators: [Validators.maxLength(this.addressMaxLength)], updateOn: 'submit' }],
      townOrCity: [
        '',
        { validators: [Validators.required, Validators.maxLength(this.addressMaxLength)], updateOn: 'submit' },
      ],
      county: [
        '',
        { validators: [Validators.required, Validators.maxLength(this.addressMaxLength)], updateOn: 'submit' },
      ],
      postcode: [
        '',
        {
          validators: [Validators.required, Validators.maxLength(this.postcodeMaxLength), this.validPostcode],
          updateOn: 'submit',
        },
      ],
    });
  }

  public setupPreFillForm(): void {
    const selectedLocation = this.workplaceInterfaceService.selectedLocationAddress$.value;

    if (this.manuallyEnteredWorkplace || this.returnToConfirmDetails) {
      this.preFillForm(selectedLocation);
    }
  }

  public preFillForm(selectedLocation: LocationAddress): void {
    this.form.setValue({
      address1: selectedLocation.addressLine1,
      address2: selectedLocation.addressLine2 ? selectedLocation.addressLine2 : null,
      address3: selectedLocation.addressLine3 ? selectedLocation.addressLine3 : null,
      county: selectedLocation.county,
      postcode: selectedLocation.postalCode,
      townOrCity: selectedLocation.townCity,
      workplaceName: selectedLocation.locationName,
    });
  }

  protected setupFormControlsMap(): void {
    this.formControlsMap = [
      {
        label: 'Workplace name',
        name: 'workplaceName',
        width: 20,
      },
      {
        label: 'Building (number or name) and street <span class="govuk-visually-hidden">line 1 of 3</span>',
        name: 'address1',
        width: 20,
      },
      {
        label: '<span class="govuk-visually-hidden">Building and street line 2 of 3</span>',
        name: 'address2',
        width: 20,
      },
      {
        label: '<span class="govuk-visually-hidden">Building and street line 3 of 3</span>',
        name: 'address3',
        width: 20,
      },
      {
        label: 'Town or city',
        name: 'townOrCity',
        width: 10,
      },
      {
        label: 'County',
        name: 'county',
        width: 10,
      },
      {
        label: 'Postcode',
        name: 'postcode',
        width: 10,
      },
    ];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceName',
        type: [
          {
            name: 'required',
            message: this.workplaceErrorMessage,
          },
          {
            name: 'maxlength',
            message: `Workplace name must be ${this.workplaceNameMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'address1',
        type: [
          {
            name: 'required',
            message: 'Enter the building (number or name) and street',
          },
          {
            name: 'maxlength',
            message: `Building (number or name) and street must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'address2',
        type: [
          {
            name: 'maxlength',
            message: `This line must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'address3',
        type: [
          {
            name: 'maxlength',
            message: `This line must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'townOrCity',
        type: [
          {
            name: 'required',
            message: 'Enter the town or city',
          },
          {
            name: 'maxlength',
            message: `Town or city must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'county',
        type: [
          {
            name: 'required',
            message: 'Enter the county',
          },
          {
            name: 'maxlength',
            message: `County must be ${this.addressMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: 'Enter the postcode',
          },
          {
            name: 'maxlength',
            message: `Postcode must be ${this.postcodeMaxLength} characters or fewer`,
          },
          {
            name: 'invalidPostcode',
            message: 'Enter a valid workplace postcode',
          },
        ],
      },
    ];
  }

  protected validPostcode(control: FormControl): { [s: string]: boolean } {
    if (!SanitizePostcodeUtil.sanitizePostcode(control.value)) {
      return { invalidPostcode: true };
    }
    return null;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.setSelectedLocationAddress();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected getLocationAddress(): LocationAddress {
    return {
      addressLine1: this.getAddress1.value,
      addressLine2: this.getAddress2.value,
      addressLine3: this.getAddress3.value,
      county: this.getCounty.value,
      locationName: this.getWorkplaceName.value,
      postalCode: this.getPostcode.value,
      townCity: this.getTownCity.value,
    };
  }

  protected setSelectedLocationAddress(): void {
    this.workplaceInterfaceService.selectedLocationAddress$.next(this.getLocationAddress());
    this.workplaceInterfaceService.manuallyEnteredWorkplace$.next(true);
    const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'type-of-employer'];
    this.router.navigate(url);
  }

  protected getNextRoute(): void {}

  protected setFlow(): void {}

  protected setTitle(): void {}

  protected setErrorMessage(): void {}

  protected setServiceVariables(): void {
    this.returnToConfirmDetails = this.workplaceInterfaceService.returnTo$.value;
    this.returnToWorkplaceNotFound = this.workplaceInterfaceService.workplaceNotFound$.value;
    this.manuallyEnteredWorkplace = this.workplaceInterfaceService.manuallyEnteredWorkplace$.value;
    this.isCqcRegulated = this.workplaceInterfaceService.isCqcRegulated$.value;
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected setConfirmDetailsBackLink(): void {}

  protected isCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.workplaceInterfaceService.workplaceNotFound$.value && this.isCqcRegulated;
  }

  protected isNotCqcRegulatedAndWorkplaceNotFound(): boolean {
    return this.workplaceInterfaceService.workplaceNotFound$.value && !this.isCqcRegulated;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
