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
  prevPage: string;

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
      this.lastSection = 8;
    }
  }

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



  // getUniqueServiceCategories(value) {
  //   const data = value;
  //   //debugger;
  //   //const allCategories = [];
  //   //const uniqueCategories = [];

  //   // let j = 0;
  //   // const temp = [];

  //   // for (let i = 0, len = data.length; i < len - 1; i++) {

  //   //   if (data[i].category !== data[i + 1].category) {

  //   //     temp[j] = data[i].category;

  //   //     j++;
  //   //   }
  //   //   temp[j] = data[len - 1].category;
  //   // }
  //   // this.uniqueCategoriesArray = temp;

  //   let obj: {};

  //   data.map(
  //     res => {

  //       for (let i = 0, len = res.length; i < len; i++) {

  //       obj = {
  //         category: res,
  //       };

  //       this.servicesData.push(obj);

  //       }

  //       console.log(this.servicesData);
  //     }
  //   );


  //   //console.log(this.uniqueCategoriesArray);

  //   //this.createNewObject(data, this.uniqueCategoriesArray);

  //   //console.log(this.allCategories);
  // }

  // createNewObject(data, categoryArray) {
  //   //const serviceList = data;
  //   const uniqueCategoryList = categoryArray;

  //   //const newObject;

  //   for (let i = 0, len = categoryArray.length; i < len; i++) {

  //     const catData = categoryArray;
  //     const servicesData = [];

  //     if (catData[i] !== catData[i + 1]) {

  //       const catObject = [{
  //         catData,
  //         // serviceId: data.id,
  //         // category: data.category,
  //         // name: data.name,
  //         // cqcRegistered: data.iscqcregistered,
  //         // capacityQuestion: data.capacityquestion,
  //         // currentUptakeQuestion: data.currentuptakequestion
  //       }]
  //     }
  //     this.newObject.push(catObject);

  //   }
  //   console.log(this.newObject);
  // }


  selectMainServiceChanged(value: string): void {
    debugger;
    this.registration.locationdata[0].mainService = value;

    //console.log(this.registration[0]);
  }

  save() {
    //routerLink = "/confirm-workplace-details"
    this.registration.locationdata[0].prevPage = 'select-main-service';
    this.registration.locationdata[0].currentPage = this.currentSection;
    debugger;
    console.log(this.registration);
    this._registrationService.updateState(this.registration);
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/confirm-workplace-details']);
  }

}
