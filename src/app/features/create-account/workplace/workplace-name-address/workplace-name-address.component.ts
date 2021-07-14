import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-name-address',
  templateUrl: './workplace-name-address.component.html',
})
export class WorkplaceNameAddressComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public workplace: Establishment;
  public isParent: boolean;
  private flow: string;
  private addressMaxLength = 40;
  private postcodeMaxLength = 8;
  private workplaceNameMaxLength = 120;
  private subscriptions: Subscription = new Subscription();

  public formControlsMap = [
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

  constructor(
    private establishmentService: EstablishmentService,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private registrationService: RegistrationService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  get getPostcode() {
    return this.form.get('postcode');
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

  get getWorkplaceName() {
    return this.form.get('workplaceName');
  }

  public ngOnInit() {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.workplace?.isParent ? true : false;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
    this.setupSubscription();
  }

  public ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe((selectedLocation: LocationAddress) => {
        if (selectedLocation) {
          this.preFillForm(selectedLocation);
        }
      }),
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: ['', [Validators.required, Validators.maxLength(this.workplaceNameMaxLength)]],
      address1: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      address2: ['', [Validators.maxLength(this.addressMaxLength)]],
      address3: ['', [Validators.maxLength(this.addressMaxLength)]],
      county: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
      postcode: ['', [Validators.required, Validators.maxLength(this.postcodeMaxLength)]],
      townOrCity: ['', [Validators.required, Validators.maxLength(this.addressMaxLength)]],
    });
  }

  private preFillForm(selectedLocation: LocationAddress): void {
    this.form.setValue({
      workplaceName: selectedLocation.locationName,
      address1: selectedLocation.addressLine1,
      address2: selectedLocation.addressLine2,
      address3: selectedLocation.addressLine3,
      townOrCity: selectedLocation.townCity,
      county: selectedLocation.county,
      postcode: selectedLocation.postalCode,
    });
  }

  private setupFormErrorsMap(): void {
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
      townCity: this.getTownCity.value,
      county: this.getCounty.value,
      locationName: this.getWorkplaceName.value,
      postalCode: this.getPostcode.value,
    };
  }

  private setSelectedLocationAddress(): void {
    this.registrationService.selectedLocationAddress$.next(this.getLocationAddress());
    this.registrationService.manuallyEnteredWorkplace$.next(true);
    this.router.navigate([`${this.flow}/select-main-service`]);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow, 'find-workplace'] });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
