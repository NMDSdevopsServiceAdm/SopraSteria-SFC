import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

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
  //displayValues: boolean;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.userDetailsForm = this.fb.group({
      userFullnameInput: ['', [Validators.required, Validators.maxLength(120)]],
      userJobTitleInput: ['', [Validators.required, Validators.maxLength(120)]],
      userEmailInput: ['', [Validators.required, Validators.maxLength(120)]],
      userPhoneInput: ['', [Validators.required, Validators.maxLength(50)]]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    //console.log(this.registration);

    this.changeDetails();

  }

  changeDetails(): void {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      let userFullnameValue = this.registration[0].user.fullname;
      let userJobTitleValue = this.registration[0].user.jobTitle;
      let userEmailValue = this.registration[0].user.emailAddress;
      let userPhoneValue = this.registration[0].user.contactNumber;

      this.userDetailsForm.setValue({
        userFullnameInput: userFullnameValue,
        userJobTitleInput: userJobTitleValue,
        userEmailInput: userEmailValue,
        userPhoneInput: userPhoneValue
      });

    }

  }

  save() {
    // Get form details
    let userFullnameValue = this.userDetailsForm.get('userFullnameInput').value;
    let userJobTitleValue = this.userDetailsForm.get('userJobTitleInput').value;
    let userEmailValue = this.userDetailsForm.get('userEmailInput').value;
    let userPhoneValue = this.userDetailsForm.get('userPhoneInput').value;

    //this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      let createUsernameValue = this.registration[0].user.username;
      let createPasswordValue = this.registration[0].user.password;
      let createSecurityQuestionValue = this.registration[0].user.securityQuestion;
      let createsecurityAnswerValue = this.registration[0].user.securityAnswer;
    }

    this.registration[0]['user'] = {};
    this.registration[0].user['fullname'] = userFullnameValue;
    this.registration[0].user['jobTitle'] = userJobTitleValue;
    this.registration[0].user['emailAddress'] = userEmailValue;
    this.registration[0].user['contactNumber'] = userPhoneValue;

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      this.registration[0].user['username'] = createUsernameValue;
      this.registration[0].user['password'] = createPasswordValue;
      this.registration[0].user['securityQuestion'] = createSecurityQuestionValue;
      this.registration[0].user['securityAnswer'] = createsecurityAnswerValue;
    }

    this._registrationService.updateState(this.registration);
    //this._registrationService.routingCheck(this.registration);

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      this.router.navigate(['/confirm-account-details']);
    }
    else {
      this.router.navigate(['/create-username']);
    }

  }

 
}
