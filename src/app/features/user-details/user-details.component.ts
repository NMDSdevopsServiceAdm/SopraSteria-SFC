import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userDetailsForm: FormGroup;
  registration: RegistrationModel;

  //submitted = false;
  submittedfullname = false;
  submittedJobTitle = false;
  submittedEmail = false;
  submittedPhone = false;

  createUsernameValue: string;
  createPasswordValue: string;
  createSecurityQuestionValue: string;
  createsecurityAnswerValue: string;

  // Set up Validation messages
  fullnameMessage: string;
  jobTitleMessage: string;
  emailMessage: string;
  phoneMessage: string;

  private fullnameMessages = {
    maxlength: 'Your fullname must be no longer than 120 characters.',
    required: 'Please enter your fullname.'
  };

  private jobTitleMessages = {
    maxlength: 'Your job title must be no longer than 120 characters.',
    required: 'Please enter your job title.'
  };

  private emailMessages = {
    maxlength: 'Your email address must be no longer than 120 characters.',
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  };

  private phoneMessages = {
    maxlength: 'Your contact phone number must be no longer than 50 characters.',
    required: 'Please enter your contact phone number.'
  };


  constructor(
    private _registrationService: RegistrationService,
    private router: Router, private route: ActivatedRoute,
    private fb: FormBuilder) { }

  // Get user fullname
  get getUserFullnameInput() {
    return this.userDetailsForm.get('userFullnameInput');
  }

  // Get user job title
  get getUserJobTitle() {
    return this.userDetailsForm.get('userJobTitleInput');
  }

  // Get user email input
  get getUserEmailInput() {
    return this.userDetailsForm.get('userEmailInput');
  }

  // Get user email input
  get getUserPhoneInput() {
    return this.userDetailsForm.get('userPhoneInput');
  }

  ngOnInit() {
    this.userDetailsForm = this.fb.group({
      userFullnameInput: ['', [Validators.required, Validators.maxLength(120)]],
      userJobTitleInput: ['', [Validators.required, Validators.maxLength(120)]],
      userEmailInput: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      userPhoneInput: ['', [Validators.required, Validators.maxLength(50)]]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // Check validation on each field
    // const fullnameControl = this.userDetailsForm.get('userFullnameInput');
    // const jobTitleControl = this.userDetailsForm.get('userJobTitleInput');
    // const emailControl = this.userDetailsForm.get('userEmailInput');
    // const phoneControl = this.userDetailsForm.get('userPhoneInput');

    // fullname watcher
    this.getUserFullnameInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setFullnameMessage(this.getUserFullnameInput)
    );

    // jobTitle watcher
    this.getUserJobTitle.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setJobTitleMessage(this.getUserJobTitle)
    );

    // email watcher
    this.getUserEmailInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        this.setEmailMessage(this.getUserEmailInput);
      }
    );

    // phone watcher
    this.getUserPhoneInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPhoneMessage(this.getUserPhoneInput)
    );

    // Check if come from Account details confirmation page
    this.changeDetails();

  }

  changeDetails(): void {
    debugger;
    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      const userFullnameValue = this.registration.locationdata[0].user.fullname;
      const userJobTitleValue = this.registration.locationdata[0].user.jobTitle;
      const userEmailValue = this.registration.locationdata[0].user.emailAddress;
      const userPhoneValue = this.registration.locationdata[0].user.contactNumber;

      this.userDetailsForm.setValue({
        userFullnameInput: userFullnameValue,
        userJobTitleInput: userJobTitleValue,
        userEmailInput: userEmailValue,
        userPhoneInput: userPhoneValue
      });
    }
  }

  setFullnameMessage(c: AbstractControl): void {
    this.fullnameMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.fullnameMessage = Object.keys(c.errors).map(
        key => this.fullnameMessage += this.fullnameMessages[key]).join('<br />');
    }
    debugger;
    this.submittedfullname = false;
  }

  setJobTitleMessage(c: AbstractControl): void {
    this.jobTitleMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.jobTitleMessage = Object.keys(c.errors).map(
        key => this.jobTitleMessage += this.jobTitleMessages[key]).join('<br />');
    }
    debugger;
    this.submittedJobTitle = false;
  }

  setEmailMessage(c: AbstractControl): void {
    this.emailMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.emailMessage += this.emailMessages[key]).join('<br />');
    }
    debugger;
    this.submittedEmail = false;
  }

  setPhoneMessage(c: AbstractControl): void {
    this.phoneMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.phoneMessage = Object.keys(c.errors).map(
        key => this.phoneMessage += this.phoneMessages[key]).join('<br />');
    }
    this.submittedPhone = false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.userDetailsForm.controls; }

  onSubmit() {
    //this.submitted = true;
    this.submittedfullname = true;
    this.submittedJobTitle = true;
    this.submittedEmail = true;
    this.submittedPhone = true;

    debugger;

    // stop here if form is invalid
    if (this.userDetailsForm.invalid) {
      debugger;
        return;
    }
    else {
      debugger;
      this.save();
    }
  }

  save() {
    // Get form details
    const userFullnameValue = this.userDetailsForm.get('userFullnameInput').value;
    const userJobTitleValue = this.userDetailsForm.get('userJobTitleInput').value;
    const userEmailValue = this.userDetailsForm.get('userEmailInput').value;
    const userPhoneValue = this.userDetailsForm.get('userPhoneInput').value;

    console.log(this.registration);
    debugger;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      // Get updated form results
      debugger;
      if (this.registration.locationdata[0].user.hasOwnProperty('username')) {
        this.createUsernameValue = this.registration.locationdata[0].user.username;
      }
      if (this.registration.locationdata[0].user.hasOwnProperty('password')) {
        this.createPasswordValue = this.registration.locationdata[0].user.password;
      }
      if (this.registration.locationdata[0].user.hasOwnProperty('securityQuestion')) {
        this.createSecurityQuestionValue = this.registration.locationdata[0].user.securityQuestion;
      }
      if (this.registration.locationdata[0].user.hasOwnProperty('securityAnswer')) {
        this.createsecurityAnswerValue = this.registration.locationdata[0].user.securityAnswer;
      }
    }

    this.registration.locationdata[0]['user'] = {} as {
      fullname: string,
      jobTitle: string,
      emailAddress: string,
      contactNumber: string,
      username: string,
      password: string,
      securityQuestion: string,
      securityAnswer: string,
    };
    this.registration.locationdata[0].user['fullname'] = userFullnameValue;
    this.registration.locationdata[0].user['jobTitle'] = userJobTitleValue;
    this.registration.locationdata[0].user['emailAddress'] = userEmailValue;
    this.registration.locationdata[0].user['contactNumber'] = userPhoneValue;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      //if (this.registration[0].locationdata.user.hasOwnProperty('username')) {
        this.registration.locationdata[0].user['username'] = this.createUsernameValue;
      //}
      //if (this.registration[0].locationdata.user.hasOwnProperty('password')) {
        this.registration.locationdata[0].user['password'] = this.createPasswordValue;
      ///}
      //if (this.registration[0].locationdata.user.hasOwnProperty('securityQuestion')) {
        this.registration.locationdata[0].user['securityQuestion'] = this.createSecurityQuestionValue;
      //}
      //if (this.registration[0].locationdata.user.hasOwnProperty('securityAnswer')) {
        this.registration.locationdata[0].user['securityAnswer'] = this.createsecurityAnswerValue;
      //}
    }
    debugger;

    this._registrationService.updateState(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    } else {
      this.router.navigate(['/create-username']);
    }

  }

}
