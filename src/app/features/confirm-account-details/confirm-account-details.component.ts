import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
  styleUrls: ['./confirm-account-details.component.scss']
})
export class ConfirmAccountDetailsComponent implements OnInit {
  registration: RegistrationModel;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged')) {
      delete this.registration.detailsChanged;
      console.log(this.registration);
    }
    //this.registration[0]['detailsChanged'] = undefined;
  }

  submit() {

    this._registrationService.postRegistration(this.registration);
    //this.router.navigate(['/registration-complete']);
  }

  changeDetails() {

    this.registration['detailsChanged'] = true;
    console.log(this.registration);

    this._registrationService.updateState(this.registration);

    //if (this.registration[0].hasOwnProperty('detailsChanged')) {
    //  this.registration[0]['detailsChanged'] = true;
    //}
    //else {
    //  this.registration[0]['isRegulated'] = false;
    //}

    //this._registrationService.updateState(this.registration);

  }

}
