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

  currentSection: number;
  lastSection: number;
  prevPage: string;

  constructor(private _registrationService: RegistrationService, private router: Router) {}

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.prevPage = this.registration.locationdata[0].prevPage;
    const currentpage = this.registration.locationdata[0].currentPage;

    this.currentSection = currentpage + 1;
    debugger;

    if ((this.prevPage === 'registered-question') && (this.currentSection === 2)) {
      //this.currentSection = '2';
      this.lastSection = 7;
    }
    else if ((this.prevPage === 'select-workplace') && (this.currentSection === 3)) {
      //this.currentSection = '3';
      this.lastSection = 7;
    }
    else if ((this.prevPage === 'select-main-service') && (this.currentSection === 4)) {
      this.lastSection = 8;
    }
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
    this.registration.locationdata[0].prevPage = 'confirm-workplace-details';
    this.registration.locationdata[0].currentPage = this.currentSection;
    debugger;
    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/user-details']);
  }



}


