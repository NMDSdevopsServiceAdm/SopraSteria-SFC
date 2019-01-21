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
  addressPostcode: string;

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  nonCqcPostcodeApiError: string;

  currentSection: number;
  lastSection: number;
  backLink: string;
  secondItem: number;

  constructor(private _registrationService: RegistrationService, private router: Router) {}

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];
    this.secondItem = 1;

    this.currentSection = this.currentSection + 1;

    if (this.backLink === '/select-main-service') {
      if (this.registration.userRoute.route[this.secondItem] === '/select-workplace') {
        this.lastSection = 8;
      }
      else if (this.registration.userRoute.route[this.secondItem] === '/select-workplace-address') {
        this.lastSection = 9;
      }
      else {
        this.lastSection = 7;
      }
    }
    // if (this.backLink === '/select-workplace') {
    //   this.lastSection = 8;
    // }

    // if ((this.prevPage === 'registered-question') && (this.currentSection === 2)) {
    //   //this.currentSection = '2';
    //   this.lastSection = 7;
    // }
    // else if ((this.prevPage === 'select-workplace') && (this.currentSection === 3)) {
    //   //this.currentSection = '3';
    //   this.lastSection = 7;
    // }
    // else if ((this.prevPage === 'select-main-service') && (this.currentSection === 4)) {
    //   this.lastSection = 8;
    // }
  }

  isRegulatedCheck(id: any) {

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
    //this.registration.locationdata[0].prevPage = 'confirm-workplace-details';
    //this.registration.locationdata[0].currentPage = this.currentSection;
    this.updateSectionNumbers(this.registration);

    this._registrationService.updateState(this.registration);

    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/user-details']);
  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/confirm-workplace-details');
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;

    this.registration.userRoute.route.splice(-1);


    //this.updateSectionNumbers(this.registration);
    //this.registration.userRoute = this.registration.userRoute;
    this.registration.userRoute.currentPage = this.currentSection;
    //this.registration.userRoute['route'] = this.registration.userRoute['route'];

    this._registrationService.updateState(this.registration);

    this.router.navigate([this.backLink]);
  }

  workplaceNotFound() {
    this.addressPostcode = this.registration.locationdata[0].postalCode;

    this._registrationService.getAddressByPostCode(this.addressPostcode).subscribe(
      (data: RegistrationModel) => {
        if (data.success === 1) {
          this.updateSectionNumbers(data);

          //data = data.postcodedata;
          this._registrationService.updateState(data);
          //this.routingCheck(data);
        }

        this.router.navigate(["/select-workplace-address"])
      }
    );
  }

}


