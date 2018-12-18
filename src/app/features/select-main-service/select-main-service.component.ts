import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-select-main-service',
  templateUrl: './select-main-service.component.html',
  styleUrls: ['./select-main-service.component.scss']
})
export class SelectMainServiceComponent implements OnInit {
  SelectMainServiceForm: FormGroup;
  registration: RegistrationModel;
  selectedAddressId: string;
  regulatedCheck: boolean;
  //storeCopy: RegistrationModel;
  allCategoriesArray: {};
  uniqueCategoriesArray: any[];
  newObject: [];
  //temp = [];
  catRegulatedCheck: boolean;

  currentSection: number;
  lastSection: number;
  backLink: string;

  servicesData = [];
  testObject: [{}];
  isInvalid: boolean;

  //$scope.myArray = [];

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.SelectMainServiceForm = this.fb.group({
      mainServiceSelected: ['', Validators.required]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // Get main services
    this.getMainServices();

    // Watch mainServiceSelected
    this.SelectMainServiceForm.get('mainServiceSelected').valueChanges.subscribe(
      value => this.selectMainServiceChanged(value)
    );

    this.isInvalid = false;
    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;
    debugger;
    if (this.backLink === '/registered-question') {
      this.lastSection = 7;
    }
    else if (this.backLink === '/select-workplace') {
      this.lastSection = 8;
    }
    else if (this.backLink === '/confirm-workplace-details') {
      if (this.registration.userRoute[1].route === '/select-workplace') {
        this.lastSection = 8;
      }
      else {
        this.lastSection = 7;
      }
    }
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

  getMainServices() {
    //debugger
    //this.regulatedCheck = this.registration[0].locationdata.isRegulated;

    if (this.registration.locationdata[0].isRegulated === true) {
      this.regulatedCheck = true;
    }
    else if (this.registration.locationdata[0].locationId) {
      this.regulatedCheck = true;
    }
    else {
      this.regulatedCheck = false;
    }

    this._registrationService.getMainServices(this.regulatedCheck)
      .subscribe(
        value => this.allCategoriesArray = value
      );
  }

  selectMainServiceChanged(value: string): void {

    this.registration.locationdata[0].mainService = value;

    //console.log(this.registration[0]);
  }

  save() {
    //routerLink = "/confirm-workplace-details"

    this.updateSectionNumbers(this.registration);
    //

    console.log(this.registration);
    this._registrationService.updateState(this.registration);

    if (this.SelectMainServiceForm.invalid) {
      this.isInvalid = true;
      return;
    }
    else {
      this.router.navigate(['/confirm-workplace-details']);
    }

  }

  updateSectionNumbers(data) {
    debugger;
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/select-main-service');


    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');

    console.log(data);
    console.log(this.registration);
    debugger;
  }

}
