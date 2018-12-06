import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-create-username',
  templateUrl: './create-username.component.html',
  styleUrls: ['./create-username.component.scss']
})
export class CreateUsernameComponent implements OnInit {
  createUserNamePasswordForm: FormGroup;
  registration: RegistrationModel[];

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
    maxlength: 'Your fullname must be no longer than 120 characters.',
    required: 'Please enter your fullname.'
  };

  private passwordMessages = {
    maxlength: 'Your fullname must be no longer than 120 characters.',
    required: 'Please enter your fullname.'
  };

  private confirmPasswordMessages = {
    maxlength: 'Your fullname must be no longer than 120 characters.',
    required: 'Please enter your fullname.'
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

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
        createPasswordInput: ['', [Validators.required, Validators.maxLength(120)]],
        confirmPasswordInput: ['', [Validators.required, Validators.maxLength(120)]]
      }, { validator: checkPasswordConfirm }),
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
      value => this.setConfirmPasswordMessage(this.getConfirmPasswordInput)
    );
  }

  setCreateUsernameMessage(c: AbstractControl): void {
    this.usernameMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.usernameMessage = Object.keys(c.errors).map(
        key => this.usernameMessage += this.usernameMessages[key]).join('<br />');
    }
    debugger;
    this.submittedUsername = false;
  }

  setPasswordMessage(c: AbstractControl): void {
    this.passwordMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.passwordMessage = Object.keys(c.errors).map(
        key => this.passwordMessage += this.passwordMessages[key]).join('<br />');
    }
    debugger;
    this.submittedUsername = false;
  }

  setConfirmPasswordMessage(c: AbstractControl): void {
    this.confirmPasswordMessage = '';
    debugger;
    if ((c.touched || c.dirty) && c.errors) {
      this.confirmPasswordMessage = Object.keys(c.errors).map(
        key => this.confirmPasswordMessage += this.confirmPasswordMessages[key]).join('<br />');
    }
    debugger;
    this.submittedUsername = false;
  }

  changeDetails(): void {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      const createUsernameValue = this.registration[0].user.username;
      const createPasswordValue = this.registration[0].user.password;

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
        return;
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

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      if (this.registration[0].user.hasOwnProperty('securityQuestion')) {
        this.createSecurityQuestionValue = this.registration[0].user.securityQuestion;
      }
      if (this.registration[0].user.hasOwnProperty('securityAnswer')) {
        this.createsecurityAnswerValue = this.registration[0].user.securityAnswer;
      }
    }

    this.registration[0].user['username'] = createUsernameValue;
    this.registration[0].user['password'] = createPasswordValue;

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      if (this.registration[0].user.hasOwnProperty('securityQuestion')) {
        this.registration[0].user['securityQuestion'] = this.createSecurityQuestionValue;
      }
      if (this.registration[0].user.hasOwnProperty('securityAnswer')) {
        this.registration[0].user['securityAnswer'] = this.createsecurityAnswerValue;
      }
    }

    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    }
    else {
      this.router.navigate(['/security-question']);
    }


    //routerLink = "/security-question"
  }
}

// Check for content in both CQC registered input fields
function checkPasswordConfirm(c: AbstractControl): { [key: string]: boolean } | null {
  const passwordControl = c.get('createPasswordInput');
  const confirmPasswordControl = c.get('confirmPasswordInput');

  if (confirmPasswordControl.pristine) {
    return null;
  }

  if (passwordControl.value === confirmPasswordControl.value) {
    return null;
  }

  return { 'notMatched': true };
}
