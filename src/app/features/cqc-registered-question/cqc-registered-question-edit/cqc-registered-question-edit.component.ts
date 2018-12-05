import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../../core/services/registration.service';
import { RegistrationModel } from '../../../core/model/registration.model';
import { CqcRegisteredQuestionEnteredLocation } from './cqc-regsitered-check';


@Component({
  selector: 'app-cqc-registered-question-edit',
  templateUrl: './cqc-registered-question-edit.component.html',
  styleUrls: ['./cqc-registered-question-edit.component.scss']
})

export class CqcRegisteredQuestionEditComponent implements OnInit {
  cqcRegisteredQuestionForm: FormGroup;
  registration: RegistrationModel[];
  CqcRegisteredQuestionEnteredLocation = new CqcRegisteredQuestionEnteredLocation();
  registeredQuestionSelectedValue: string;

  // Set up Messages
  isSubmitted = false;
  submittedCqcRegPostcode = false;
  submittedCqcRegLocationId = false;
  submittedCqcRegPostcodeMessage = false;
  submittedNonCqcRegPostcodeMessage = false;

  cqcRegPostcodeMessage: string;
  cqcRegLocationIdMessage: string;
  nonCqcRegPostcodeMessage: string;

  private cqcRegPostcodeMessages = {
    maxlength: 'TS - Your postcode must be no longer than 8 characters.',
    //bothHaveContent: 'TS - Both have content.',
    required: 'TS - Please enter a postcode or Location ID.'
  };

  private cqcRegLocationIdMessages = {
    maxlength: 'TS - Your Location ID must be no longer than 50 characters.',
    //bothHaveContent: 'TS - Both have content.',
    required: 'TS - Please enter a postcode or Location ID.'
  };

  private nonCqcRegPostcodeMessages = {
    maxlength: 'TS - Your postcode must be no longer than 8 characters.',
    required: 'TS - Please enter your postcode.'
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
        locationId: ['', Validators.maxLength(50)],
      }),
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

          if (this.cqcRegisteredPostcode.errors) {
            this.isSubmitted = false;
            this.submittedCqcRegPostcode = false;
            this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
          }
          else if (this.cqcRegisteredLocationId.errors) {
            this.isSubmitted = true;
            this.submittedCqcRegLocationId = true;
            this.submittedCqcRegPostcode = true;
          }
          if (!this.cqcRegisteredPostcode.errors && !this.cqcRegisteredLocationId.errors) {
            this.isSubmitted = true;
            this.submittedCqcRegPostcode = true;
            this.submittedCqcRegLocationId = true;
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

          if (this.cqcRegisteredLocationId.errors) {
            this.isSubmitted = false;
            this.submittedCqcRegLocationId = false;
            this.setCqcRegisteredLocationIdMessage(this.cqcRegisteredLocationId);
          }
          else if (this.cqcRegisteredPostcode.errors) {
            this.isSubmitted = true;
            this.submittedCqcRegPostcode = true;
            this.submittedCqcRegLocationId = true;
          }
          if (!this.cqcRegisteredPostcode.errors && !this.cqcRegisteredLocationId.errors) {
            this.isSubmitted = true;
            this.submittedCqcRegPostcode = true;
            this.submittedCqcRegLocationId = true;
          }

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
      if (this.cqcRegisteredLocationId.errors) {
        this.isSubmitted = false;
      }
      else if (!this.cqcRegisteredPostcode.errors) {
        this.isSubmitted = true;
        this.submittedCqcRegPostcode = true;
        this.submittedCqcRegLocationId = true;
      }
      else if (this.isSubmitted && !this.cqcRegisteredLocationId.errors) {
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
      if (this.cqcRegisteredPostcode.errors) {
        this.isSubmitted = false;
      }
      else if (!this.cqcRegisteredLocationId.errors) {
        this.isSubmitted = true;
        this.submittedCqcRegPostcode = true;
        this.submittedCqcRegLocationId = true;
      }
      else if (this.isSubmitted && !this.cqcRegisteredPostcode.errors) {
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

    const isRegulated = this.cqcRegisteredQuestionForm.get('registeredQuestionSelected').value;

    if (isRegulated === 'true') {
      const cqcRegisteredPostcode = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode');
      const locationId = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId');

      if (cqcRegisteredPostcode.value.length > 0) {
        if (this.cqcRegisteredPostcode.errors) {
          this.isSubmitted = true;
          this.submittedCqcRegPostcode = false;
        }
        else {
          this.isSubmitted = true;
          this.submittedCqcRegPostcode = true;
          this.save();
        }
      }
      if (locationId.value.length > 0) {
        if (this.cqcRegisteredLocationId.errors) {

          this.isSubmitted = true;
          this.submittedCqcRegLocationId = false;
        }
        else {
          this.isSubmitted = true;
          this.submittedCqcRegLocationId = true;
          this.save();
        }
      }
      if (!locationId.value || !cqcRegisteredPostcode.value)  {
        cqcRegisteredPostcode.setValidators([Validators.required, Validators.maxLength(8)]);
        locationId.setValidators([Validators.required, Validators.maxLength(50)]);
        cqcRegisteredPostcode.updateValueAndValidity();
        locationId.updateValueAndValidity();
      }
    }
    else if (isRegulated === 'false') {
      this.save();
    }
  }

  save() {

    const cqcRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.cqcRegisteredPostcode').value;
    const locationIdValue = this.cqcRegisteredQuestionForm.get('cqcRegisteredGroup.locationId').value;
    const notRegisteredPostcodeValue = this.cqcRegisteredQuestionForm.get('notRegisteredPostcode').value;

    if (cqcRegisteredPostcodeValue.length > 0) {
      this._registrationService.getLocationByPostCode(cqcRegisteredPostcodeValue);
    }
    else if (locationIdValue.length > 0) {
      this._registrationService.getLocationByLocationId(locationIdValue);
    }
    else if (notRegisteredPostcodeValue.length > 0) {
      this._registrationService.getAddressByPostCode(notRegisteredPostcodeValue);
      this.router.navigate(['/select-workplace-address']);
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
}

// Check for content in both CQC registered input fields
function checkInputValues(c: AbstractControl): { [key: string]: boolean } | null {
  const postcodeControl = c.get('cqcRegisteredPostcode');
  const locationIdControl = c.get('locationId');

  if (postcodeControl.pristine || locationIdControl.pristine) {
    return null;
  }

  if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
    return null;
  }

  if ((postcodeControl.value.length < 1 && locationIdControl.value.length > 0) ||
      (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)) {

        return null;
  }
  return { 'bothHaveContent': true };
}



