import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

import { RegistrationService } from '../../../core/services/registration.service';
import { RegistrationModel } from '../../../core/model/registration.model';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
  styleUrls: ['./security-question.component.scss']
})
export class SecurityQuestionComponent implements OnInit {
  securityQuestionAnswerForm: FormGroup;
  registration: RegistrationModel;

  // Set up Validation messages
  securityQuestionMessage: string;
  securityAnswerMessage: string;

  currentSection: number;
  lastSection: number;
  backLink: string;
  secondItem: number;

  isSubmitted = false;
  submittedSecurityQ = false;
  submittedSecurityA = false;

  private securityQuestionMessages = {
    maxlength: 'The security question must be no longer than 255 characters.',
    required: 'Please enter your Security question.'
  };

  private securityAnswerMessages = {
    maxlength: 'The security answer must be no longer than 255 characters.',
    required: 'Please enter your Security answer.'
  };

  constructor(
    private _registrationService: RegistrationService,
    private router: Router, private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  // Get user security question
  get getSecurityQuestionInput() {
    return this.securityQuestionAnswerForm.get('securityQuestionInput');
  }

  // Get user security answer
  get getSecurityAnswerInput() {
    return this.securityQuestionAnswerForm.get('securityAnswerInput');
  }

  ngOnInit() {
    this.securityQuestionAnswerForm = this.fb.group({
      securityQuestionInput: ['', [Validators.required, Validators.maxLength(255)]],
      securityAnswerInput: ['', [Validators.required, Validators.maxLength(255)]]
    });
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // security question watcher
    this.getSecurityQuestionInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setSecurityQuestionMessage(this.getSecurityQuestionInput)
    );

    // security answer watcher
    this.getSecurityAnswerInput.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setSecurityAnswerMessage(this.getSecurityAnswerInput)
    );

    this.changeDetails();

    // Set section numbering on load
    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];
    this.secondItem = 1;

    this.currentSection = this.currentSection + 1;

    if (this.backLink === '/registration/create-username') {
      if (this.registration.userRoute.route[this.secondItem] === '/registration/select-workplace') {
        this.lastSection = 8;
      }
      else if (this.registration.userRoute.route[this.secondItem] === '/registration/select-workplace-address') {
        this.lastSection = 9;
      }
      else {
        this.lastSection = 7;
      }
    }
  }

  setSecurityQuestionMessage(c: AbstractControl): void {
    this.securityQuestionMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.securityQuestionMessage = Object.keys(c.errors).map(
        key => this.securityQuestionMessage += this.securityQuestionMessages[key]).join('<br />');
    }

    //this.submittedSecurityQ = false;
  }

  setSecurityAnswerMessage(c: AbstractControl): void {
    this.securityAnswerMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.securityAnswerMessage = Object.keys(c.errors).map(
        key => this.securityAnswerMessage += this.securityAnswerMessages[key]).join('<br />');
    }

    //this.submittedSecurityA = false;
  }

  changeDetails(): void {

    if (this.registration.hasOwnProperty('detailsChanged') && this.registration.detailsChanged === true) {
      const createSecurityQuestionValue = this.registration.locationdata[0].user.securityQuestion;
      const createsecurityAnswerValue = this.registration.locationdata[0].user.securityAnswer;

      this.securityQuestionAnswerForm.setValue({
        securityQuestionInput: createSecurityQuestionValue,
        securityAnswerInput: createsecurityAnswerValue,
      });
    }
  }

  onSubmit() {

    this.isSubmitted = true;
    this.submittedSecurityQ = true;
    this.submittedSecurityA = true;



    // stop here if form is invalid
    if (this.securityQuestionAnswerForm.invalid) {

      // this.isSubmitted = false;
      // this.submittedSecurityQ = false;
      // this.submittedSecurityA = false;
      return;
    }
    else {

      this.save();
    }
  }

  save() {
    const securityQuestionValue = this.securityQuestionAnswerForm.get('securityQuestionInput').value;
    const securityAnswerValue = this.securityQuestionAnswerForm.get('securityAnswerInput').value;

    this.registration.locationdata[0].user['securityQuestion'] = securityQuestionValue;
    this.registration.locationdata[0].user['securityAnswer'] = securityAnswerValue;

    this.updateSectionNumbers(this.registration);

    this._registrationService.updateState(this.registration);

    this.router.navigate(['/registration/confirm-account-details']);
  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/registration/security-question');
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;
    this.registration.userRoute.route.splice(-1);

    //this.updateSectionNumbers(this.registration);
    //this.registration.userRoute = this.registration.userRoute;
    this.registration.userRoute.currentPage = this.currentSection;
    //this.registration.userRoute['route'] = this.registration.userRoute['route'];
    this._registrationService.updateState(this.registration);

    this.router.navigate([this.backLink]);
  }

}
