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
      createUsernameInput: ['', Validators.maxLength(120)],
      createPasswordInput: ['', Validators.maxLength(120)],
      confirmPasswordInput: ['', Validators.maxLength(120)]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);
  }

  save() {
    let createUsernameValue = this.createUserNamePasswordForm.get('createUsernameInput').value;
    let createPasswordValue = this.createUserNamePasswordForm.get('createPasswordInput').value;
    //let confirmPasswordValue = this.createUserNamePasswordForm.get('confirmPasswordInput').value;

    debugger;
    this.registration[0].user['username'] = createUsernameValue;
    this.registration[0].user['password'] = createPasswordValue;

    console.log(this.registration);

    this._registrationService.updateState(this.registration);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/security-question']);

    //routerLink = "/security-question"
  }
}
