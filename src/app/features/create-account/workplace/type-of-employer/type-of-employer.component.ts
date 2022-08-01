import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: '../../../../shared/directives/create-workplace/type-of-employer/type-of-employer.component.html',
})
export class TypeOfEmployerComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  private flow: string;
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public serverError: string;
  public isRegulated: boolean;
  public returnToConfirmDetails: URLStructure;
  public showOtherInputField = false;
  private maxLength = 120;
  public section = 'Workplace';
  public options = [
    { value: 'Local Authority (adult services)', text: 'Local authority (adult services)' },
    { value: 'Local Authority (generic/other)', text: 'Local authority (generic, other)' },
    { value: 'Private Sector', text: 'Private sector' },
    { value: 'Voluntary / Charity', text: 'Voluntary, charity, non-profit (not for profit)' },
    { value: 'Other', text: 'Other' },
  ];

  constructor(
    public formBuilder: FormBuilder,
    public backService: BackService,
    public router: Router,
    public route: ActivatedRoute,
    public errorSummaryService: ErrorSummaryService,
    public registrationService: RegistrationService,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.isRegulated = this.registrationService.isRegulated();
    this.returnToConfirmDetails = this.registrationService.returnTo$.value;
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.setBackLink();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        employerType: ['', Validators.required],
        other: [null, Validators.maxLength(this.maxLength)],
      },
      { updateOn: 'submit' },
    );
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.backService.setBackLink({ url: [this.flow, 'confirm-details'] });
      return;
    }

    const route = this.isRegulated ? this.getCQCRegulatedBackLink() : this.getNonCQCRegulatedBackLink();
    this.backService.setBackLink({ url: [this.flow, route] });
  }

  private prefillForm(): void {
    if (this.registrationService.typeOfEmployer$.value) {
      this.showOtherInputField = !!this.registrationService.typeOfEmployer$.value.other;
      this.form.setValue({
        employerType: this.registrationService.typeOfEmployer$.value.value,
        other: this.showOtherInputField ? this.registrationService.typeOfEmployer$.value.other : null,
      });
    }
  }

  private getCQCRegulatedBackLink(): string {
    if (this.registrationService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.registrationService.locationAddresses$.value.length == 1) {
      return 'your-workplace';
    }
    if (this.registrationService.locationAddresses$.value.length > 1) {
      return 'select-workplace';
    }
  }

  private getNonCQCRegulatedBackLink(): string {
    if (this.registrationService.manuallyEnteredWorkplace$.value) {
      return 'workplace-name-address';
    }
    if (this.registrationService.manuallyEnteredWorkplaceName$.value) {
      return 'workplace-name';
    }
    return 'select-workplace-address';
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'employerType',
        type: [
          {
            name: 'required',
            message: 'Select the type of employer',
          },
        ],
      },
      {
        item: 'other',
        type: [
          {
            name: 'maxlength',
            message: `Other Employer type must be ${this.maxLength} characters or less`,
          },
        ],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.generateUpdateProps();
      this.navigateToNextPage();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? 'confirm-details' : 'select-main-service';
    this.router.navigate([this.flow, url]);
  }

  private generateUpdateProps(): void {
    const { employerType, other } = this.form.value;

    const employerTypeObject = {
      value: employerType,
      ...(employerType === 'Other' && { other }),
    };

    this.registrationService.typeOfEmployer$.next(employerTypeObject);
  }

  public onOtherSelect(radioValue: string): void {
    this.showOtherInputField = radioValue === 'Other';
  }
}
