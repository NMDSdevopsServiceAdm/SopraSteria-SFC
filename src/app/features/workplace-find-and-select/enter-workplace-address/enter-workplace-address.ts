import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Directive()
export class EnterWorkplaceAddressDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public isWorkPlaceUpdate: boolean;
  public form: FormGroup;

  public formControlsMap: any[] = [
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
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public title: string;
  protected flow: string;
  protected workplaceNameMaxLength = 120;
  protected addressMaxLength = 40;
  protected postcodeMaxLength = 8;
  protected subscriptions: Subscription = new Subscription();

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
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
      workplaceName: ['', [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)]],
      address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      address2: ['', [Validators.maxLength(this.addressMaxLength)]],
      address3: ['', [Validators.maxLength(this.addressMaxLength)]],
      townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      county: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength)]],
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
        item: 'workplaceName',
        type: [
          {
            name: 'required',
            message: 'Enter the name of your workplace',
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
            message: `Building and street must be ${this.addressMaxLength} characters or fewer`,
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
            message: 'Enter the county.',
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

  // check
  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-workplace-address`] });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
