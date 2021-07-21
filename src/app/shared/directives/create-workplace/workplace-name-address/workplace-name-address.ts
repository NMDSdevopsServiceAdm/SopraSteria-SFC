import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
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
  public isCqcRegulated: boolean;
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
    this.setIsCqcRegulated();
    this.init();
    this.setFormControlsMap();
    this.setupFormErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected init(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setIsCqcRegulated(): void {}

  protected getWorkplaceNameIfNotCqcRegulated(): void {}

  public setupForm(): void {
    if (this.isCqcRegulated || this.isWorkPlaceUpdate) {
      this.form = this.formBuilder.group({
        workplaceName: ['', [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)]],
        address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        address2: ['', [Validators.maxLength(this.addressMaxLength)]],
        address3: ['', [Validators.maxLength(this.addressMaxLength)]],
        townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        county: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength), this.validPostcode]],
      });
    } else {
      this.form = this.formBuilder.group({
        address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        address2: ['', [Validators.maxLength(this.addressMaxLength)]],
        address3: ['', [Validators.maxLength(this.addressMaxLength)]],
        townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        county: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
        postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength), this.validPostcode]],
      });
    }
  }

  public setFormControlsMap(): void {
    const formControlsMap = [
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

    if (this.isCqcRegulated || this.isWorkPlaceUpdate) {
      formControlsMap.unshift({
        label: 'Workplace name',
        name: 'workplaceName',
        width: 20,
      });
    }
    this.formControlsMap = formControlsMap;
  }

  protected preFillForm(selectedLocation: LocationAddress): void {
    const selectedLocationData = {
      address1: selectedLocation.addressLine1,
      address2: selectedLocation.addressLine2,
      address3: selectedLocation.addressLine3,
      county: selectedLocation.county,
      postcode: selectedLocation.postalCode,
      townOrCity: selectedLocation.townCity,
    };

    if (this.isCqcRegulated) {
      this.form.setValue({
        workplaceName: selectedLocation.locationName,
        ...selectedLocationData,
      });
      return;
    }

    this.form.setValue({
      ...selectedLocationData,
    });
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
    const locationAddress = {
      addressLine1: this.getAddress1.value,
      addressLine2: this.getAddress2.value,
      addressLine3: this.getAddress3.value,
      county: this.getCounty.value,
      postalCode: this.getPostcode.value,
      townCity: this.getTownCity.value,
    };

    return {
      locationName: this.isCqcRegulated ? this.getWorkplaceName.value : this.getWorkplaceNameIfNotCqcRegulated(),
      ...locationAddress,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setSelectedLocationAddress(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
