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

  currentSection: number;
  lastSection: number;
  backLink: string;

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);

    if (this.registration.hasOwnProperty('detailsChanged')) {
      delete this.registration.detailsChanged;
      console.log(this.registration);
    }
    //this.registration[0]['detailsChanged'] = undefined;

    // Set section numbering on load
    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;

    debugger;
    if (this.backLink === '/security-question') {
      debugger;
      if (this.registration.userRoute.route[1] === '/select-workplace') {
        this.lastSection = 8;
      }
      else if (this.registration.userRoute.route[1] === '/select-workplace-address') {
        this.lastSection = 9;
      }
      else {
        this.lastSection = 7;
      }
    }
  }

  submit() {
    debugger;
    this._registrationService.postRegistration(this.registration);
    //this.router.navigate(['/registration-complete']);
  }

  changeDetails() {

    this.registration['detailsChanged'] = true;
    console.log(this.registration);

    this._registrationService.updateState(this.registration);

  }

  updateSectionNumbers(data) {
    debugger;
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/confirm-account-details');

    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');

    console.log(data);
    console.log(this.registration);
    debugger;
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;
    debugger;
    this.registration.userRoute.route.splice(-1);
    debugger;

    //this.updateSectionNumbers(this.registration);
    //this.registration.userRoute = this.registration.userRoute;
    this.registration.userRoute.currentPage = this.currentSection;
    //this.registration.userRoute['route'] = this.registration.userRoute['route'];
    debugger;
    this._registrationService.updateState(this.registration);

    debugger;
    this.router.navigate([this.backLink]);
  }

}
