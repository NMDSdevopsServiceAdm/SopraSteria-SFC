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
  registration: RegistrationModel[];

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

  ngOnInit() {
    this.userDetailsForm = this.fb.group({
      userFullnameInput: ['', [Validators.required, Validators.maxLength(120)]], updateOn: 'blur',
      userJobTitleInput: ['', [Validators.required, Validators.maxLength(120)]],
      userEmailInput: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      userPhoneInput: ['', [Validators.required, Validators.maxLength(50)]]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // Check validation on each field
    const fullnameControl = this.userDetailsForm.get('userFullnameInput');
    const jobTitleControl = this.userDetailsForm.get('userJobTitleInput');
    const emailControl = this.userDetailsForm.get('userEmailInput');
    const phoneControl = this.userDetailsForm.get('userPhoneInput');

    // fullname watcher
    fullnameControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setFullnameMessage(fullnameControl)
    );

    // jobTitle watcher
    jobTitleControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setJobTitleMessage(jobTitleControl)
    );

    // email watcher
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        this.setEmailMessage(emailControl);
      }
    );

    // phone watcher
    phoneControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPhoneMessage(phoneControl)
    );

    // Check if come from Account details confirmation page
    this.changeDetails();

  }

  changeDetails(): void {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      const userFullnameValue = this.registration[0].user.fullname;
      const userJobTitleValue = this.registration[0].user.jobTitle;
      const userEmailValue = this.registration[0].user.emailAddress;
      const userPhoneValue = this.registration[0].user.contactNumber;

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

    if ((c.touched || c.dirty) && c.errors) {
      this.fullnameMessage = Object.keys(c.errors).map(
        key => this.fullnameMessage += this.fullnameMessages[key]).join('<br />');
    }
    this.submittedfullname = false;
  }

  setJobTitleMessage(c: AbstractControl): void {
    this.jobTitleMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.jobTitleMessage = Object.keys(c.errors).map(
        key => this.jobTitleMessage += this.jobTitleMessages[key]).join('<br />');
    }
    this.submittedJobTitle = false;
  }

  setEmailMessage(c: AbstractControl): void {
    this.emailMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.emailMessage += this.emailMessages[key]).join('<br />');
    }
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

      // stop here if form is invalid
      if (this.userDetailsForm.invalid) {
          return;
      }
      alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.userDetailsForm.value));
  }

  save() {
    // Get form details
    const userFullnameValue = this.userDetailsForm.get('userFullnameInput').value;
    const userJobTitleValue = this.userDetailsForm.get('userJobTitleInput').value;
    const userEmailValue = this.userDetailsForm.get('userEmailInput').value;
    const userPhoneValue = this.userDetailsForm.get('userPhoneInput').value;

    console.log(this.registration);

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      if (this.registration[0].user.hasOwnProperty('username')) {
        const createUsernameValue = this.registration[0].user.username;
      }
      if (this.registration[0].user.hasOwnProperty('password')) {
        const createPasswordValue = this.registration[0].user.password;
      }
      if (this.registration[0].user.hasOwnProperty('securityQuestion')) {
        const createSecurityQuestionValue = this.registration[0].user.securityQuestion;
      }
      if (this.registration[0].user.hasOwnProperty('securityAnswer')) {
        const createsecurityAnswerValue = this.registration[0].user.securityAnswer;
      }
    }

    this.registration[0]['user'] = {} as {
      fullname: string,
      jobTitle: string,
      emailAddress: string,
      contactNumber: string,
      username: string,
      password: string,
      securityQuestion: string,
      securityAnswer: string,
    };
    this.registration[0].user['fullname'] = userFullnameValue;
    this.registration[0].user['jobTitle'] = userJobTitleValue;
    this.registration[0].user['emailAddress'] = userEmailValue;
    this.registration[0].user['contactNumber'] = userPhoneValue;

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      if (this.registration[0].user.hasOwnProperty('username')) {
        this.registration[0].user['username'] = this.createUsernameValue;
      }
      if (this.registration[0].user.hasOwnProperty('password')) {
        this.registration[0].user['password'] = this.createPasswordValue;
      }
      if (this.registration[0].user.hasOwnProperty('securityQuestion')) {
        this.registration[0].user['securityQuestion'] = this.createSecurityQuestionValue;
      }
      if (this.registration[0].user.hasOwnProperty('securityAnswer')) {
        this.registration[0].user['securityAnswer'] = this.createsecurityAnswerValue;
      }
    }

    this._registrationService.updateState(this.registration);

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    } else {
      this.router.navigate(['/create-username']);
    }

  }


}
