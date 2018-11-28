import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
  styleUrls: ['./security-question.component.scss']
})
export class SecurityQuestionComponent implements OnInit {
  securityQuestionAnswerForm: FormGroup;
  registration: RegistrationModel[];

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.securityQuestionAnswerForm = this.fb.group({
      securityQuestionInput: ['', [Validators.required, Validators.maxLength(120)]],
      securityAnswerInput: ['', [Validators.required, Validators.maxLength(120)]]
    });
    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);
    this.changeDetails();
  }

  changeDetails(): void {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      let createSecurityQuestionValue = this.registration[0].user.securityQuestion;
      let createsecurityAnswerValue = this.registration[0].user.securityAnswer;

      this.securityQuestionAnswerForm.setValue({
        securityQuestionInput: createSecurityQuestionValue,
        securityAnswerInput: createsecurityAnswerValue,
      });

    }

  }

  save() {
    let securityQuestionValue = this.securityQuestionAnswerForm.get('securityQuestionInput').value;
    let securityAnswerValue = this.securityQuestionAnswerForm.get('securityAnswerInput').value;

    this.registration[0].user['securityQuestion'] = securityQuestionValue;
    this.registration[0].user['securityAnswer'] = securityAnswerValue;

    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/confirm-account-details']);

    //routerLink="/confirm-account-details"
  }

}
