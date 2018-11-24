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
  registration: RegistrationModel;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.userDetailsForm = this.fb.group({
      userFullnameInput: ['', Validators.maxLength(120)],
      userJobTitleInput: ['', Validators.maxLength(120)],
      userEmailInput: ['', Validators.maxLength(120)],
      userPhoneInput: ['', Validators.maxLength(50)]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);
  }

  save() {
    let userFullnameValue = this.userDetailsForm.get('userFullnameInput').value;
    let userJobTitleValue = this.userDetailsForm.get('userJobTitleInput').value;
    let userEmailValue = this.userDetailsForm.get('userEmailInput').value;
    let userPhoneValue = this.userDetailsForm.get('userPhoneInput').value;

    debugger;
    this.registration.user[0].fullname = userFullnameValue;
    this.registration.user[0].jobTitle = userJobTitleValue;
    this.registration.user[0].emailAddress = userEmailValue;
    this.registration.user[0].contactNumber = userPhoneValue;
    console.log(this.registration);

    this._registrationService.updateState(this.registration);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/create-username']);

  }

}
