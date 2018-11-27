import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

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
  }

  changeDetails(): void {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      debugger;
      let createUsernameValue = this.registration[0].user.username;
      let createPasswordValue = this.registration[0].user.password;

      this.createUserNamePasswordForm.setValue({
        createUsernameInput: createUsernameValue,
        passwordGroup: {
          createPasswordInput: createPasswordValue,
          confirmPasswordInput: createPasswordValue
        }
      });

    }

  }

  save() {

    let createUsernameValue = this.createUserNamePasswordForm.get('createUsernameInput').value;
    let createPasswordValue = this.createUserNamePasswordForm.get('passwordGroup.createPasswordInput').value;
    //let confirmPasswordValue = this.createUserNamePasswordForm.get('confirmPasswordInput').value;

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      debugger;
      let createSecurityQuestionValue = this.registration[0].user.securityQuestion;
      let createsecurityAnswerValue = this.registration[0].user.securityAnswer;
    }

    this.registration[0].user['username'] = createUsernameValue;
    this.registration[0].user['password'] = createPasswordValue;

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      // Get updated form results
      this.registration[0].user['securityQuestion'] = createSecurityQuestionValue;
      this.registration[0].user['securityAnswer'] = createsecurityAnswerValue;
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
