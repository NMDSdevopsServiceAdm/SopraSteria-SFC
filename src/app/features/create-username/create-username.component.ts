import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { CustomValidators } from './../../shared/custom-form-validators';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
  styleUrls: ['./create-username.component.scss']
})
export class CreateUsernameComponent implements OnInit {
  createUserNamePasswordForm: FormGroup;
  registration: RegistrationModel;

  createSecurityQuestionValue: string;
  createsecurityAnswerValue: string;

  isSubmitted = false;
  submittedUsername = false;
  submittedPassword = false;
  submittedConfirmPassword = false;

  // Set up Validation messages
  usernameMessage: string;
  passwordMessage: string;
  confirmPasswordMessage: string;

  private usernameMessages = {
    maxlength: 'Your username must be no longer than 120 characters.',
    required: 'Please enter your username.'
  };

  private passwordMessages = {
    minlength: 'Your password must be a minimum of 8 characters.',
    maxlength: 'Your password must be no longer than 120 characters.',
    required: 'Please enter your password.',
    pattern: 'Invalid password'
  };

  private confirmPasswordMessages = {
    required: 'Please confirm your password.',
    notMatched: 'Confirm Password does not match.'
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  // Get password group
  get getPasswordGroup() {
    return this.createUserNamePasswordForm.get('passwordGroup');
  }

  // Get create username
  get getCreateUsernameInput() {
    return this.createUserNamePasswordForm.get('createUsernameInput');
  }

  // Get create password
  get getPasswordInput() {
    return this.createUserNamePasswordForm.get('passwordGroup.createPasswordInput');
  }

  // Get confirm password
  get getConfirmPasswordInput() {
    return this.createUserNamePasswordForm.get('passwordGroup.confirmPasswordInput');
  }

  ngOnInit() {
    this.createUserNamePasswordForm = this.fb.group({
      createUsernameInput: ['', [Validators.required, Validators.maxLength(120)]],
      passwordGroup: this.fb.group({
        createPasswordInput: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}')]],
        confirmPasswordInput: ['', [Validators.required]]
      }, { validator: CustomValidators.matchInputValues })
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);

    this.changeDetails();

    // Create username watcher
    this.getCreateUsernameInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setCreateUsernameMessage(this.getCreateUsernameInput)
    );

    // Create password watcher
    this.getPasswordInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setPasswordMessage(this.getPasswordInput)
    );

    // Confirm password watcher
    this.getConfirmPasswordInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        debugger;
        if (value.length > 0) {
          this.isSubmitted = false;
          this.submittedConfirmPassword = false;
          if (this.getPasswordGroup.errors) {
            this.setConfirmPasswordMessage(this.getPasswordGroup);
          }
          else if (this.getConfirmPasswordInput.errors) {
            this.setConfirmPasswordMessage(this.getConfirmPasswordInput);
          }
          else if ((!this.getPasswordGroup.errors) && (!this.getConfirmPasswordInput.errors)) {
            this.setConfirmPasswordMessage(this.getConfirmPasswordInput);
          }
        }
        else {
          this.isSubmitted = false;
          this.submittedConfirmPassword = false;
          this.setConfirmPasswordMessage(this.getConfirmPasswordInput);
        }
      }
    );
  }

  setCreateUsernameMessage(c: AbstractControl): void {
    this.usernameMessage = '';
    debugger;
    if (c.errors) {
      this.usernameMessage = Object.keys(c.errors).map(
        key => this.usernameMessage += this.usernameMessages[key]).join(' ');
    }
    debugger;
    //this.submittedUsername = false;
  }

  setPasswordMessage(c: AbstractControl): void {
    this.passwordMessage = '';
    debugger;
    if (c.errors) {
      this.passwordMessage = Object.keys(c.errors).map(
        key => this.passwordMessage += this.passwordMessages[key]).join(' ');
    }
    debugger;
    //this.submittedPassword = false;
  }

  setConfirmPasswordMessage(c: AbstractControl): void {
    this.confirmPasswordMessage = '';
    debugger;
    if (c.errors) {
      this.confirmPasswordMessage = Object.keys(c.errors).map(
        key => this.confirmPasswordMessage += this.confirmPasswordMessages[key]).join(' ');
    }
    else {
      if (this.submittedConfirmPassword && !this.getConfirmPasswordInput.errors) {
        this.save();
      }
    }
    debugger;
    //this.submittedConfirmPassword = false;
  }

  changeDetails(): void {

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      const createUsernameValue = this.registration.locationdata[0].user.username;
      const createPasswordValue = this.registration.locationdata[0].user.password;

      this.createUserNamePasswordForm.setValue({
        createUsernameInput: createUsernameValue,
        passwordGroup: {
          createPasswordInput: createPasswordValue,
          confirmPasswordInput: createPasswordValue
        }
      });

    }

  }

  onSubmit() {
    debugger;
    this.isSubmitted = true;
    this.submittedUsername = true;
    this.submittedPassword = true;
    this.submittedConfirmPassword = true;

    debugger;

    // stop here if form is invalid
    if (this.createUserNamePasswordForm.invalid) {
      debugger;
      //this.isSubmitted = false;
      //this.submittedUsername = false;
      //this.submittedPassword = false;
      //this.submittedConfirmPassword = false;
      //return;
    }
    else {
      debugger;
      this.save();
    }
  }

  save() {

    const createUsernameValue = this.createUserNamePasswordForm.get('createUsernameInput').value;
    const createPasswordValue = this.createUserNamePasswordForm.get('passwordGroup.createPasswordInput').value;
    //let confirmPasswordValue = this.createUserNamePasswordForm.get('confirmPasswordInput').value;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      // Get updated form results
      if (this.registration.locationdata[0].user.hasOwnProperty('securityQuestion')) {
        this.createSecurityQuestionValue = this.registration.locationdata[0].user.securityQuestion;
      }
      if (this.registration.locationdata[0].user.hasOwnProperty('securityAnswer')) {
        this.createsecurityAnswerValue = this.registration.locationdata[0].user.securityAnswer;
      }
    }

    this.registration.locationdata[0].user['username'] = createUsernameValue;
    this.registration.locationdata[0].user['password'] = createPasswordValue;

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      // Get updated form results
      if (this.registration.locationdata[0].user.hasOwnProperty('securityQuestion')) {
        this.registration.locationdata[0].user['securityQuestion'] = this.createSecurityQuestionValue;
      }
      if (this.registration.locationdata[0].user.hasOwnProperty('securityAnswer')) {
        this.registration.locationdata[0].user['securityAnswer'] = this.createsecurityAnswerValue;
      }
    }

    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    }
    else {
      this.router.navigate(['/security-question']);
    }


    //routerLink = "/security-question"
  }
}

// Check for content in both CQC registered input fields
// function matchInputValues(c: AbstractControl): { [key: string]: boolean } | null {
//   const passwordControl = c.get('createPasswordInput');
//   const confirmPasswordControl = c.get('confirmPasswordInput');

//   if (confirmPasswordControl.pristine) {
//     return null;
//   }

//   if (passwordControl.value === confirmPasswordControl.value) {
//     return null;
//   }

//   return { 'notMatched': true };
// }
