import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationModel } from '@core/model/registration.model';
import { RegistrationService } from '@core/services/registration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
})
export class CqcRegisteredQuestionComponent implements OnInit {
  cqcRegisteredQuestionForm: FormGroup;
  registration: RegistrationModel;
  registeredQuestionSelectedValue: string;
  isRegulated: boolean;

  // Set up Messages
  isSubmitted = false;
  submittedCqcRegPostcode = false;
  submittedCqcRegLocationId = false;

  cqcRegPostcodeMessage: string;
  cqcRegLocationIdMessage: string;
  nonCqcRegPostcodeMessage: string;

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  nonCqcPostcodeApiError: string;

  currentSection: number;
  lastSection: number;
  backLink: string;

  private cqcRegPostcodeMessages = {
    maxlength: 'Your postcode must be no longer than 8 characters.',
    bothHaveContent: 'Both have content.',
  };

  private cqcRegLocationIdMessages = {
    maxlength: 'Your Location ID must be no longer than 50 characters.',
    bothHaveContent: 'Both have content.',
  };

  private nonCqcRegPostcodeMessages = {
    maxlength: 'Your postcode must be no longer than 8 characters.',
    required: 'Please enter your postcode.',
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  // Get registered question
  get registeredQuestion() {
    return this.cqcRegisteredQuestionForm.get('registeredQuestionSelected');
  }

  // Get registered group
  get cqcRegisteredGroup() {
    return this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup');
  }

  // Get registered question
  get cqcRegisteredPostcode() {
    return this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode');
  }

  // Get registered location Id
  get cqcRegisteredLocationId() {
    return this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId');
  }

  // Get registered location Id
  get notRegisteredPostcode() {
    return this.cqcRegisteredQuestionForm.get('notRegisteredPostcode');
  }

  ngOnInit() {
    this.cqcRegisteredQuestionForm = this.fb.group({
      registeredQuestionSelected: '',
      radioSelect: 'registeredQuestionSelected',
      cqcRegisteredGroup: this.fb.group(
        {
          cqcRegisteredPostcode: ['', Validators.maxLength(8)],
          locationId: ['', Validators.maxLength(50)],
        },
        { validator: CustomValidators.multipleValuesValidator }
      ),
      notRegisteredPostcode: '',
    });

    // -- START -- Validation check watchers
    // Watch registeredQuestionSelected
    this.cqcRegisteredQuestionForm
      .get('registeredQuestionSelected')
      .valueChanges.subscribe(value => this.registeredQuestionChanged(value));

    // CQC Registered Postcode watcher
    this.cqcRegisteredPostcode.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
      if (value.length > 0) {
        if (this.cqcRegisteredGroup.errors) {
          this.setCqcRegPostcodeMessage(this.cqcRegisteredGroup);
        }
        if (this.cqcRegisteredPostcode.errors) {
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        }
      } else {
        this.isSubmitted = false;
        this.submittedCqcRegPostcode = false;
        this.submittedCqcRegLocationId = false;
        this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
      }
    });

    // CQC Registered Postcode watcher
    this.cqcRegisteredLocationId.valueChanges.pipe(debounceTime(1000)).subscribe(value => {
      if (value.length > 0) {
        if (this.cqcRegisteredGroup.errors) {
          this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredGroup);
        }
        if (this.cqcRegisteredLocationId.errors) {
          this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredLocationId);
        }
      } else {
        this.isSubmitted = false;
        this.submittedCqcRegPostcode = false;
        this.submittedCqcRegLocationId = false;
        this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredLocationId);
      }
    });

    // Non CQC registered postcode watcher
    this.notRegisteredPostcode.valueChanges
      .pipe(debounceTime(1000))
      .subscribe(value => this.setNonCqcRegPostcodeMessage(this.notRegisteredPostcode));
    // -- END -- Validation check watchers

    this._registrationService.registration$.subscribe(registration => (this.registration = registration));

    this.setSectionNumbers();
  }

  // -- START -- Set validation handlers
  setCqcRegPostcodeMessage(c: AbstractControl): void {
    this.cqcRegPostcodeMessage = '';

    if (c.errors) {
      this.cqcRegPostcodeMessage = Object.keys(c.errors)
        .map(key => (this.cqcRegPostcodeMessage += this.cqcRegPostcodeMessages[key]))
        .join(' ');
    } else {
      if (this.isSubmitted && !this.cqcRegisteredLocationId.errors) {
        this.save();
      }
    }
  }

  setCqcRegisteredLocationIdMessage(c: AbstractControl): void {
    this.cqcRegLocationIdMessage = '';

    if (c.errors) {
      this.cqcRegLocationIdMessage = Object.keys(c.errors)
        .map(key => (this.cqcRegLocationIdMessage += this.cqcRegLocationIdMessages[key]))
        .join('<br />');
    } else {
      if (this.isSubmitted && !this.cqcRegisteredPostcode.errors) {
        this.save();
      }
    }
  }

  setNonCqcRegPostcodeMessage(c: AbstractControl): void {
    this.nonCqcRegPostcodeMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.nonCqcRegPostcodeMessage = Object.keys(c.errors)
        .map(key => (this.nonCqcRegPostcodeMessage += this.nonCqcRegPostcodeMessages[key]))
        .join('<br />');
    }
  }
  // -- END -- Set validation handlers

  // -- START -- convenience getter for easy access to form fields
  get f() {
    return this.cqcRegisteredQuestionForm.controls;
  }
  // -- END -- convenience getter for easy access to form fields

  onSubmit() {
    this.isRegulated = this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').value;

    if (this.isRegulated === true) {
      const cqcRegisteredPostcode = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode');
      const locationId = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId');
      // Clear value of not cqc registered postcode if previously entered

      if (cqcRegisteredPostcode.value.length > 0 || locationId.value.length > 0) {
        if (this.cqcRegisteredQuestionForm.invalid || this.cqcRegisteredGroup.errors) {
          return;
        } else {
          this.save();
        }
      }
    } else {
      // Clear value of cqc registered postcode and location Id if previously entered

      if (this.cqcRegisteredQuestionForm.invalid) {
        return;
      } else {
        this.save();
      }
    }
  }

  save() {
    const cqcRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode')
      .value;
    const locationIdValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId').value;
    const notRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode').value;

    if (cqcRegisteredPostcodeValue.length > 0) {
      this._registrationService.getLocationByPostCode(cqcRegisteredPostcodeValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.updateSectionNumbers(data);

            this._registrationService.updateState(data);
            this.router.navigate(['/select-workplace']);
          }
        },
        (err: any) => {
          this.cqcPostcodeApiError = err;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        },
        () => {
          console.log('Get location by postcode complete');
        }
      );
    } else if (locationIdValue.length > 0) {
      this._registrationService.getLocationByLocationId(locationIdValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.updateSectionNumbers(data);

            this._registrationService.updateState(data);
            this.router.navigate(['/select-workplace']);
          }
        },
        (err: any) => {
          this.cqclocationApiError = err;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        },
        () => {
          console.log('Get location by id sucessful');
        }
      );
    } else if (notRegisteredPostcodeValue.length > 0) {
      this._registrationService.getAddressByPostCode(notRegisteredPostcodeValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.updateSectionNumbers(data);
            this.setRegulatedCheckFalse(data);

            this._registrationService.updateState(data);
          }
        },
        (err: any) => {
          this.nonCqcPostcodeApiError = err;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        },
        () => {
          console.log('Get location by postcode complete');
          this.router.navigate(['/select-workplace-address']);
        }
      );
    }
  }

  // Check if user is CQC Registered or not and display appropriate fields
  // If not CQC registered is selected set postcodes validation
  registeredQuestionChanged(value: string): void {
    this.registeredQuestionSelectedValue = value;
    const notRegisteredPostcode = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode');

    if (this.registeredQuestionSelectedValue === 'false') {
      this.resetFormInputsOnChange('nonCqcReg');
      notRegisteredPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    } else if (this.registeredQuestionSelectedValue === 'true') {
      this.resetFormInputsOnChange('cqcReg');
      notRegisteredPostcode.setValidators(Validators.maxLength(8));
    }
    notRegisteredPostcode.updateValueAndValidity();
  }

  resetFormInputsOnChange(isReg) {
    if (isReg === 'cqcReg') {
      this.cqcRegisteredPostcode.setValue('');
      this.cqcRegisteredLocationId.setValue('');
    } else {
      this.notRegisteredPostcode.setValue('');
    }
  }

  // Routing check
  routingCheck(data) {
    this.router.navigate(['/select-workplace']);
  }

  setSectionNumbers() {
    this.currentSection = 0;
    this.backLink = '/login';

    this.currentSection = this.currentSection + 1;
    this.lastSection = 8;
  }

  updateSectionNumbers(data) {
    if (this.registration.userRoute) {
      data['userRoute'] = this.registration.userRoute;
      data.userRoute['currentPage'] = this.registration.userRoute['currentPage'];
      data.userRoute['route'] = this.registration.userRoute['route'];
      data.userRoute['route'].push('/registered-question');
    } else {
      data['userRoute'] = {};
      data.userRoute['currentPage'] = this.currentSection;
      data.userRoute['route'] = [];
      data.userRoute['route'].push('/registered-question');
    }
  }

  setRegulatedCheckFalse(reg) {
    // clear default location data
    reg.locationdata = [{}];
    reg.locationdata[0]['isRegulated'] = false;
  }
}
