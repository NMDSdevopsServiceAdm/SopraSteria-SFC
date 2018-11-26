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
  detailsChanged: boolean;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

 

  save() {
    let userFullnameValue = this.userDetailsForm.get('userFullnameInput').value;
    let userJobTitleValue = this.userDetailsForm.get('userJobTitleInput').value;
    let userEmailValue = this.userDetailsForm.get('userEmailInput').value;
    let userPhoneValue = this.userDetailsForm.get('userPhoneInput').value;

    //this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
    debugger;

    this.registration[0]['user'] = [];
    this.registration[0].user['fullname'] = userFullnameValue;
    this.registration[0].user['jobTitle'] = userJobTitleValue;
    this.registration[0].user['emailAddress'] = userEmailValue;
    this.registration[0].user['contactNumber'] = userPhoneValue;

    this._registrationService.updateState(this.registration);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/create-username']);

  }

  changeDetails() {

    if (this.registration[0].hasOwnProperty('detailsChanged') && this.registration[0].detailsChanged === true) {
      
    }
    
  }

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

}
