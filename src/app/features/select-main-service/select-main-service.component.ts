import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

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

  currentSection: number;
  lastSection: number;
  backLink: string;

  servicesData = [];
  testObject: [{}];

  //$scope.myArray = [];

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.SelectMainServiceForm = this.fb.group({
      mainServiceSelected: ''
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    // Get main services
    this.getMainServices();

    // Watch mainServiceSelected
    this.SelectMainServiceForm.get('mainServiceSelected').valueChanges.subscribe(
      value => this.selectMainServiceChanged(value)
    );

    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;
    debugger;
    if (this.backLink === 'registered-question') {
      this.lastSection = 8;
    }
    else if (this.backLink === 'select-workplace') {
      this.lastSection = 9;
    }
  }

  // setSectionNumbers() {
  //   this.prevPage = this.registration.locationdata[0].prevPage;
  //   const currentpage = this.registration.locationdata[0].currentPage;

  //   this.currentSection = currentpage + 1;


  //   if ((this.prevPage === 'registered-question') && (this.currentSection === 2)) {
  //     //this.currentSection = '2';
  //     this.lastSection = 7;
  //   }
  //   else if ((this.prevPage === 'select-workplace') && (this.currentSection === 3)) {
  //     //this.currentSection = '3';
  //     this.lastSection = 8;
  //   }
  // }

  getMainServices() {
    debugger
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
        // value => this.getUniqueServiceCategories(value)
        value => {
          this.allCategoriesArray = value;
        }
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
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/confirm-workplace-details']);
  }

  updateSectionNumbers(data) {
    debugger;
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/registered-question', '/select-workplace');


    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');

    console.log(data);
    console.log(this.registration);
    debugger;
  }

}
