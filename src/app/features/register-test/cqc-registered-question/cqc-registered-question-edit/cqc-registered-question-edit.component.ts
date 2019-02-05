
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../../../core/services/registration.service';
import { RegistrationModel } from '../../../../core/model/registration.model';
import { RegistrationTrackerError } from '../../../../core/model/registrationTrackerError.model';
import { CqcRegisteredQuestionEnteredLocation } from './cqc-regsitered-check';
import { CustomValidators } from '../../../../shared/custom-form-validators';

@Component({
  selector: 'app-cqc-registered-question-edit',
  templateUrl: './cqc-registered-question-edit.component.html',
  styleUrls: ['./cqc-registered-question-edit.component.scss']
})

export class CqcRegisteredQuestionEditComponent implements OnInit {
  cqcRegisteredQuestionForm: FormGroup;
  registration: RegistrationModel;
  CqcRegisteredQuestionEnteredLocation = new CqcRegisteredQuestionEnteredLocation();
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

  private cqcRegPostcodeMessages = {
    maxlength: 'Your postcode must be no longer than 8 characters.',
    bothHaveContent: 'Both have content.',
    //required: 'TS - Please enter a postcode or Location ID.'
  };

  private cqcRegLocationIdMessages = {
    maxlength: 'Your Location ID must be no longer than 50 characters.',
    bothHaveContent: 'Both have content.'
    //required: 'TS - Please enter a postcode or Location ID.'
  };

  private nonCqcRegPostcodeMessages = {
    maxlength: 'Your postcode must be no longer than 8 characters.',
    required: 'Please enter your postcode.'
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

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
      cqcRegisteredGroup: this.fb.group({
        cqcRegisteredPostcode: ['', Validators.maxLength(8)],
        locationId: ['', Validators.maxLength(50)]
      }, { validator: CustomValidators.multipleValuesValidator }),
      notRegisteredPostcode: ''
    });

    // -- START -- Validation check watchers
    // Watch registeredQuestionSelected
    this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').valueChanges.subscribe(
      value => this.registeredQuestionChanged(value)
    );

    // CQC Registered Postcode watcher
    this.cqcRegisteredPostcode.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        if (value.length > 0) {

          if (this.cqcRegisteredGroup.errors) {
            this.setCqcRegPostcodeMessage(this.cqcRegisteredGroup);
          }
          if (this.cqcRegisteredPostcode.errors) {
            this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
          }
        }
        else {
          this.isSubmitted = false;
          this.submittedCqcRegPostcode = false;
          this.submittedCqcRegLocationId = false;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        }
      }
    );

    // CQC Registered Postcode watcher
    this.cqcRegisteredLocationId.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        if (value.length > 0) {

          if (this.cqcRegisteredGroup.errors) {
            //this.setCqcRegPostcodeMessage(this.cqcRegisteredGroup);
            this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredGroup);
          }
          if (this.cqcRegisteredLocationId.errors) {
            //this.isSubmitted = false;
            //this.submittedCqcRegLocationId = false;
            this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredLocationId);
          }
          // else if (this.cqcRegisteredPostcode.errors) {
          //   this.isSubmitted = true;
          //   this.submittedCqcRegPostcode = true;
          //   this.submittedCqcRegLocationId = true;
          // }
          // if (!this.cqcRegisteredPostcode.errors && !this.cqcRegisteredLocationId.errors) {
          //   this.isSubmitted = true;
          //   this.submittedCqcRegPostcode = true;
          //   this.submittedCqcRegLocationId = true;
          // }

        }
        else {
          this.isSubmitted = false;
          this.submittedCqcRegPostcode = false;
          this.submittedCqcRegLocationId = false;
          this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredLocationId);
        }
      }
    );

    // Non CQC registered postcode watcher
    this.notRegisteredPostcode.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setNonCqcRegPostcodeMessage(this.notRegisteredPostcode)
    );
    // -- END -- Validation check watchers

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
  }

  // -- START -- Set validation handlers
  setCqcRegPostcodeMessage(c: AbstractControl): void {
    this.cqcRegPostcodeMessage = '';

    if (c.errors) {
      this.cqcRegPostcodeMessage = Object.keys(c.errors).map(
        key => this.cqcRegPostcodeMessage += this.cqcRegPostcodeMessages[key]).join(' ');
    }
    else {
      // if (this.cqcRegisteredLocationId.errors) {
      //   this.isSubmitted = false;
      // }
      // else if (!this.cqcRegisteredPostcode.errors) {
      //   // this.isSubmitted = true;
      //   // this.submittedCqcRegPostcode = true;
      //   // this.submittedCqcRegLocationId = true;
      // }
      if (this.isSubmitted && !this.cqcRegisteredLocationId.errors) {
        this.save();
      }
    }
  }

  setCqcRegisteredLocationIdMessage(c: AbstractControl): void {
    this.cqcRegLocationIdMessage = '';

    if (c.errors) {
      this.cqcRegLocationIdMessage = Object.keys(c.errors).map(
        key => this.cqcRegLocationIdMessage += this.cqcRegLocationIdMessages[key]).join('<br />');
    }
    else {

      if (this.isSubmitted && !this.cqcRegisteredPostcode.errors) {
        this.save();
      }
    }
  }

  setNonCqcRegPostcodeMessage(c: AbstractControl): void {
    this.nonCqcRegPostcodeMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.nonCqcRegPostcodeMessage = Object.keys(c.errors).map(
        key => this.nonCqcRegPostcodeMessage += this.nonCqcRegPostcodeMessages[key]).join('<br />');
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
      //this.notRegisteredPostcode.value = '';

      if ((cqcRegisteredPostcode.value.length > 0) || (locationId.value.length > 0)) {
        if (this.cqcRegisteredQuestionForm.invalid || this.cqcRegisteredGroup.errors) {
          return;
        }
        else {
          this.save();
        }
      }
    }
    else {
      // Clear value of cqc registered postcode and location Id if previously entered
      //this.cqcRegisteredPostcode.value = '';
      //this.cqcRegisteredLocationId.value = '';

      if (this.cqcRegisteredQuestionForm.invalid) {
        return;
      }
      else {
        this.save();
      }
    }
  }

  save() {

    const cqcRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode').value;
    const locationIdValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId').value;
    const notRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode').value;

    if (cqcRegisteredPostcodeValue.length > 0) {
      this._registrationService.getLocationByPostCode(cqcRegisteredPostcodeValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {

            this.setSectionNumbers(data);

            //data = data.locationdata;
            this._registrationService.updateState(data);
            this._registrationService.routingCheck(data);
          }
        },
        (err: RegistrationTrackerError) => {
          this.cqcPostcodeApiError = err.friendlyMessage;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        },
        () => {
          console.log('Get location by postcode complete');
        }
      );
    }
    else if (locationIdValue.length > 0) {
      this._registrationService.getLocationByLocationId(locationIdValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {

            this.setSectionNumbers(data);

            //data = data.locationdata;
            this._registrationService.updateState(data);
            this._registrationService.routingCheck(data);
          }
        },
        (err: RegistrationTrackerError) => {
          this.cqclocationApiError = err.friendlyMessage;
          this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
        },
        () => {
          console.log('Get location by id sucessful');
        }
      );
    }
    else if (notRegisteredPostcodeValue.length > 0) {
      this._registrationService.getAddressByPostCode(notRegisteredPostcodeValue).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {

            this.setSectionNumbers(data);

            //data = data.postcodedata;
            this._registrationService.updateState(data);
            //this.routingCheck(data);
          }
        },
        (err: RegistrationTrackerError) => {

          this.nonCqcPostcodeApiError = err.friendlyMessage;
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
      notRegisteredPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
    }
    else if (this.registeredQuestionSelectedValue === 'true') {
      notRegisteredPostcode.setValidators(Validators.maxLength(8));
    }
    notRegisteredPostcode.updateValueAndValidity();
  }

  // Routing check
  routingCheck(data) {
    if (data.length > 1) {
      this.router.navigate(['/select-workplace']);
    } else {

      if (data[0].mainService === '') {
        this.router.navigate(['/select-main-service']);
      } else {
        this.router.navigate(['/confirm-workplace-details']);
      }

    }
  }

  setSectionNumbers(data) {

    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.registration.userRoute['currentPage'] = 1;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/registered-question');
  }
}



