import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

export class EnterWorkplaceAddress implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected addressMaxLength = 40;
  protected flow: string;
  protected postcodeMaxLength = 8;
  protected subscriptions: Subscription = new Subscription();
  protected workplaceNameMaxLength = 120;
  protected isWorkPlaceUpdate: boolean;
  public form: FormGroup;

  public formControlsMap: any[] = [
    {
      label: 'Workplace name',
      name: 'workplaceName',
      width: 20,
    },
    {
      label: 'Building and street <span class="govuk-visually-hidden">line 1 of 3</span>',
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
      label: 'Town or City',
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
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router
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

  // Get address 3
  get getAddress3() {
    return this.form.get('address3');
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
    this.setupFormErrorsMap();
    this.init();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      address2: ['', [Validators.maxLength(this.addressMaxLength)]],
      address3: ['', [Validators.maxLength(this.addressMaxLength)]],
      county: ['', [Validators.maxLength(this.addressMaxLength)]],
      postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength)]],
      townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      workplaceName: ['', [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)]],
    });
  }

  protected preFillForm(selectedLocation: LocationAddress): void {
    this.form.setValue({
      address1: selectedLocation.addressLine1,
      address2: selectedLocation.addressLine2,
      address3: selectedLocation.addressLine3,
      county: selectedLocation.county,
      postcode: selectedLocation.postalCode,
      townOrCity: selectedLocation.townCity,
      workplaceName: selectedLocation.locationName,
    });
  }

  protected setupFormErrorsMap(): void {
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
        item: 'address3',
        type: [
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

  protected setSelectedLocationAddress(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-workplace-address`] });
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
