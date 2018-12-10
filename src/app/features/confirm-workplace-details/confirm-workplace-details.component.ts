import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
  styleUrls: ['./confirm-workplace-details.component.scss']
})
export class ConfirmWorkplaceDetailsComponent implements OnInit {
  registration: RegistrationModel;
  //isRegulatedAddress: any;

  constructor(private _registrationService: RegistrationService, private router: Router) {}

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);
  }

  isRegulatedCheck(id: any) {
    debugger;
    if (id.locationdata[0].hasOwnProperty('locationId')) {
      this.registration.locationdata[0]['isRegulated'] = true;
    }
    else {
      this.registration.locationdata[0]['isRegulated'] = false;
    }

  }

  save() {
    //this._registrationService.getLocationByLocationId(this.selectedAddressId);
    //const isRegulatedAddress = [this.registration[0].locationdata[0].locationId];
    this.isRegulatedCheck(this.registration);

    //console.log(isRegulatedAddress);

    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/user-details']);
  }



}


