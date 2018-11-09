import { Component, OnInit } from '@angular/core';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { LocationService } from '../../core/services/location.service';

import { CqcRegisteredCheck } from './cqc-regsitered-check';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
  styleUrls: ['./cqc-registered-question.component.scss']
})

export class CqcRegisteredQuestionComponent {

  questionCheck = new CqcRegisteredCheck('', '', '');
  submitted = false;

  constructor(private locationService: LocationService, private router: Router) { }

  ngOnInit() {
   // this.locationService.getLocationApi();
  }

  getLocations() {
    //return this.http.get('<!--https://api.cqc.org.uk/public/v1/locations-->');

    //1-1000210669 testable locationID
    //1-1000401911

    //this.tests();
    //console.log(this.locationService.getLocationApi());
  }

  

  onSubmit() {
    this.submitted = true;

    this.routeQuestionCheck(this.questionCheck, this.router);
  }

  // Simple check to see which input field they enter and route to appropriate component
  routeQuestionCheck = function (input: any, router) {
    console.log(input);

    var postcodeYesCheck = input.postcodeYes.length,
        locationIdCheck = input.locationId.length,
        postcodeNoCheck = input.postcodeNo.length;

    if (postcodeYesCheck) {
      router.navigate(['/select-workplace']);
      console.log(postcodeYesCheck);
    }
    else if (locationIdCheck) {
      router.navigate(['/confirm-workplace-details']);
      console.log(locationIdCheck);
    }
    else if (postcodeNoCheck) {
      router.navigate(['/select-workplace-address']);
      console.log(postcodeNoCheck);
    }
    
  }
  

  


  
}
