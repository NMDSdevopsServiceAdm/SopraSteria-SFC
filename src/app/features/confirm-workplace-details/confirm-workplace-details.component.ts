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
  registration: RegistrationModel[];
  //isRegulatedAddress: any;

  constructor(private _registrationService: RegistrationService, private router: Router) {}

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
  }

  isRegulatedCheck(id: any) {

    if (id[0].hasOwnProperty('locationId')) {
      debugger;
      this.registration[0]['isRegulated'] = true;
    }
    else {
      debugger;
      this.registration[0]['isRegulated'] = false;
    }

  }

  save() {
    //this._registrationService.getLocationByLocationId(this.selectedAddressId);
    const isRegulatedAddress = [this.registration[0].locationId];
    this.isRegulatedCheck(this.registration);
    

    //console.log(isRegulatedAddress);
    debugger;
    this._registrationService.updateState(this.registration);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/user-details']);
  }

  

}


