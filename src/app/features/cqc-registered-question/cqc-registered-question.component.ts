import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationModel } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { debounceTime } from 'rxjs/operators';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
})
export class CqcRegisteredQuestionComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private registration: RegistrationModel;
  public submitted = false;

  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private errorSummaryService: ErrorSummaryService
  ) {}

  get regulatedByCQC() {
    return this.form.get('regulatedByCQC');
  }

  get group() {
    return this.form.get('group');
  }

  get regulatedPostcode() {
    return this.group.get('regulatedPostcode');
  }

  get locationId() {
    return this.group.get('locationId');
  }

  get nonRegulatedPostcode() {
    return this.form.get('nonRegulatedPostcode');
  }

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();

    // CQC Registered Postcode watcher
    // this.regulatedPostcode.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
    //   if (value.length > 0) {
    //     if (this.group.errors) {
    //       this.setCqcRegPostcodeMessage(this.group);
    //     }
    //     if (this.regulatedPostcode.errors) {
    //       this.setCqcRegPostcodeMessage(this.regulatedPostcode);
    //     }
    //   } else {
    //     this.submittedCqcRegPostcode = false;
    //     this.submittedCqcRegLocationId = false;
    //     this.setCqcRegPostcodeMessage(this.regulatedPostcode);
    //   }
    // });

    // CQC Registered Postcode watcher
    // this.locationId.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
    //   if (value.length > 0) {
    //     if (this.group.errors) {
    //       this.setCqcRegisteredLocationIdMessage(this.group);
    //     }
    //     if (this.locationId.errors) {
    //       this.setCqcRegisteredLocationIdMessage(this.locationId);
    //     }
    //   } else {
    //     this.submittedCqcRegPostcode = false;
    //     this.submittedCqcRegLocationId = false;
    //     this.setCqcRegisteredLocationIdMessage(this.locationId);
    //   }
    // });

    this.subscriptions.add(
      this.registrationService.registration$.subscribe((registration: RegistrationModel) => this.registration = registration)
    );
  }

  private setupForm(): void {
    this.form = this.fb.group({
      regulatedByCQC: [null, Validators.required],
      group: this.fb.group(
        {
          regulatedPostcode: ['', Validators.maxLength(8)],
          locationId: ['', Validators.maxLength(50)],
        },
      ),
      nonRegulatedPostcode: ['', Validators.maxLength(8)],
    });
  }

  public onRegulatedByCQCTruthy(): void {
    console.log('onRegulatedByCQCTruthy fired');
    this.group.setValidators([CustomValidators.checkMultipleInputValues]);
    this.group.updateValueAndValidity();

    this.nonRegulatedPostcode.setValidators(Validators.maxLength(8));
    this.nonRegulatedPostcode.updateValueAndValidity();
  }

  public onRegulatedByCQCFalsy(): void {
    console.log('onRegulatedByCQCFalsy fired');
    this.group.clearValidators();
    this.group.updateValueAndValidity();

    this.nonRegulatedPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    this.nonRegulatedPostcode.updateValueAndValidity();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'regulatedByCQC',
        type: [
          {
            name: 'required',
            message: 'Please specify if you are regulated by CQC.',
          },
        ],
      },
      {
        item: 'group',
        type: [
          {
            name: 'bothAreEmpty',
            message: 'Both postcode and location ID cannot be empty. Please enter a postcode or a location ID.',
          },
          {
            name: 'bothHaveContent',
            message: 'Both postcode and location ID cannot be entered. Please fill out one field.',
          },
        ],
      },
      {
        item: 'regulatedPostcode',
        type: [
          {
            name: 'maxlength',
            message: 'Your postcode must be no longer than 8 characters.',
          },
        ],
      },
      {
        item: 'locationId',
        type: [
          {
            name: 'maxlength',
            message: 'Your location ID must be no longer than 50 characters.',
          },
        ],
      },
      {
        item: 'nonRegulatedPostcode',
        type: [
          {
            name: 'required',
            message: 'Please enter your postcode.',
          },
          {
            name: 'maxlength',
            message: 'Your postcode must be no longer than 8 characters.',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment.',
      },
    ];
  }

  // -- START -- Set validation handlers
  // setCqcRegPostcodeMessage(c: AbstractControl): void {
  //   this.cqcRegPostcodeMessage = '';
  //
  //   if (c.errors) {
  //     this.cqcRegPostcodeMessage = Object.keys(c.errors)
  //       .map(key => (this.cqcRegPostcodeMessage += this.cqcRegPostcodeMessages[key]))
  //       .join(' ');
  //   } else {
  //     if (this.submitted && !this.locationId.errors) {
  //       this.save();
  //     }
  //   }
  // }
  //
  // setCqcRegisteredLocationIdMessage(c: AbstractControl): void {
  //   this.cqcRegLocationIdMessage = '';
  //
  //   if (c.errors) {
  //     this.cqcRegLocationIdMessage = Object.keys(c.errors)
  //       .map(key => (this.cqcRegLocationIdMessage += this.cqcRegLocationIdMessages[key]))
  //       .join('<br />');
  //   } else {
  //     if (this.submitted && !this.regulatedPostcode.errors) {
  //       this.save();
  //     }
  //   }
  // }
  //
  // setNonCqcRegPostcodeMessage(c: AbstractControl): void {
  //   this.nonCqcRegPostcodeMessage = '';
  //
  //   if ((c.touched || c.dirty) && c.errors) {
  //     this.nonCqcRegPostcodeMessage = Object.keys(c.errors)
  //       .map(key => (this.nonCqcRegPostcodeMessage += this.nonCqcRegPostcodeMessages[key]))
  //       .join('<br />');
  //   }
  // }
  // -- END -- Set validation handlers

  public onSubmit(): void {
    console.log('onSubmit fired');
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
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

  private save(): void {
    if (this.regulatedPostcode.value.length > 0) {
      this.registrationService.getLocationByPostCode(this.regulatedPostcode.value).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.registrationService.updateState(data);
            this.router.navigate(['/select-workplace']);
          }
        },
        (err: any) => {
          // this.cqcPostcodeApiError = err;
          // this.setCqcRegPostcodeMessage(this.regulatedPostcode);
        },
        () => {
          console.log('Get location by postcode complete');
        }
      );
    } else if (this.locationId.value.length > 0) {
      this.registrationService.getLocationByLocationId(this.locationId.value).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.registrationService.updateState(data);
            this.router.navigate(['/select-workplace']);
          }
        },
        (err: any) => {
          // TODO replace with error summary map
          // this.cqclocationApiError = err;
          // this.setCqcRegPostcodeMessage(this.regulatedPostcode);
        },
        () => {
          console.log('Get location by id sucessful');
        }
      );
    } else if (this.nonRegulatedPostcode.value.length > 0) {
      this.registrationService.getAddressByPostCode(this.nonRegulatedPostcode.value).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            // this.setRegulatedCheckFalse(data);

            this.registrationService.updateState(data);
          }
        },
        (err: any) => {
          // this.nonCqcPostcodeApiError = err;
          // this.setCqcRegPostcodeMessage(this.regulatedPostcode);
        },
        () => {
          console.log('Get location by postcode complete');
          this.router.navigate(['/select-workplace-address']);
        }
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Check if user is CQC Registered or not and display appropriate fields
  // If not CQC registered is selected set postcodes validation
  // registeredQuestionChanged(value: string): void {
  //   if (this.regulatedByCQC.value === 'false') {
  //     this.resetFormInputsOnChange('nonCqcReg');
  //     this.nonRegulatedPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
  //   } else if (this.regulatedByCQC.value === 'true') {
  //     this.resetFormInputsOnChange('cqcReg');
  //     this.nonRegulatedPostcode.setValidators(Validators.maxLength(8));
  //   }
  //   this.nonRegulatedPostcode.updateValueAndValidity();
  // }
  //
  // resetFormInputsOnChange(isReg) {
  //   if (isReg === 'cqcReg') {
  //     this.regulatedPostcode.setValue('');
  //     this.locationId.setValue('');
  //   } else {
  //     this.nonRegulatedPostcode.setValue('');
  //   }
  // }
  //
  // setRegulatedCheckFalse(reg) {
  //   // clear default location data
  //   reg.locationdata = [{}];
  //   reg.locationdata[0]['isRegulated'] = false;
  // }
}
