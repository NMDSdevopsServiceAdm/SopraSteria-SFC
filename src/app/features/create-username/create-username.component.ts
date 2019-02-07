import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { RegistrationTrackerError } from '../../core/model/registrationTrackerError.model';
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

  usernameApiError: string;

  currentSection: number;
  lastSection: number;
  backLink: string;
  secondItem: number;

  isSubmitted = false;
  submittedUsername = false;
  submittedPassword = false;
  submittedConfirmPassword = false;

  // Set up Validation messages
  usernameMessage: string;
  passwordMessage: string;
  confirmPasswordMessage: string;

  private usernameMessages = {
    maxlength: 'Your username must be no longer than 50 characters.',
    required: 'Please enter your username.'
  };

  private passwordMessages = {
    minlength: 'Your password must be a minimum of 8 characters.',
    maxlength: 'Your password must be no longer than 50 characters.',
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
      createUsernameInput: ['', [Validators.required, Validators.maxLength(50)]],
      passwordGroup: this.fb.group({
        createPasswordInput: ['', [Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,50}')]],
        confirmPasswordInput: ['', [Validators.required]]
      }, { validator: CustomValidators.matchInputValues })
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // Create username watcher
    this.getCreateUsernameInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => {
        this.checkUsernameDuplicate(value);

        this.setCreateUsernameMessage(this.getCreateUsernameInput);
      }
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

    this.changeDetails();

    // Set section numbering on load
    this.setSectionNumbers();
  }

  checkUsernameDuplicate(value) {

    this._registrationService.getUsernameDuplicate(value)
    .subscribe(
      (data: RegistrationModel) => {
        if (data['status'] === '1') {

          this.usernameApiError = data.message;

          this.setCreateUsernameMessage(this.getCreateUsernameInput);

        }
        else {
          this.usernameApiError = null;
        }
      },
      (err: RegistrationTrackerError) => {
        console.log(err);
        this.usernameApiError = err.message;
        this.setCreateUsernameMessage(this.getCreateUsernameInput);
      },
      () => {
        console.log('Get location by postcode complete');
      }
    );
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];
    this.secondItem = 1;

    this.currentSection = this.currentSection + 1;

    if (this.backLink === '/user-details') {

      if (this.registration.userRoute.route[this.secondItem] === '/select-workplace') {
        this.lastSection = 8;
      }
      else if (this.registration.userRoute.route[this.secondItem] === '/select-workplace-address') {
        this.lastSection = 9;
      }
      else {
        this.lastSection = 7;
      }
    }
  }

  setCreateUsernameMessage(c: AbstractControl): void {
    this.usernameMessage = '';

    if (c.errors) {
      this.usernameMessage = Object.keys(c.errors).map(
        key => this.usernameMessage += this.usernameMessages[key]).join(' ');
    }

  }

  setPasswordMessage(c: AbstractControl): void {
    this.passwordMessage = '';

    if (c.errors) {
      this.passwordMessage = Object.keys(c.errors).map(
        key => this.passwordMessage += this.passwordMessages[key]).join(' ');
    }

  }

  setConfirmPasswordMessage(c: AbstractControl): void {
    this.confirmPasswordMessage = '';

    if (c.errors) {
      this.confirmPasswordMessage = Object.keys(c.errors).map(
        key => this.confirmPasswordMessage += this.confirmPasswordMessages[key]).join(' ');
    }
    else {
      if (this.submittedConfirmPassword && !this.getConfirmPasswordInput.errors) {
        this.save();
      }
    }

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

    this.isSubmitted = true;
    this.submittedUsername = true;
    this.submittedPassword = true;
    this.submittedConfirmPassword = true;

    // stop here if form is invalid
    if (this.createUserNamePasswordForm.invalid || this.usernameApiError) {

      return;
    }
    else {
      this.save();
    }
  }

  save() {

    const createUsernameValue = this.createUserNamePasswordForm.get('createUsernameInput').value;
    const createPasswordValue = this.createUserNamePasswordForm.get('passwordGroup.createPasswordInput').value;

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

    this.updateSectionNumbers(this.registration);

    this._registrationService.updateState(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    }
    else {
      this.router.navigate(['/security-question']);
    }
  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/create-username');
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;
    this.registration.userRoute.route.splice(-1);

    this.registration.userRoute.currentPage = this.currentSection;

    this._registrationService.updateState(this.registration);

    this.router.navigate([this.backLink]);
  }
}
