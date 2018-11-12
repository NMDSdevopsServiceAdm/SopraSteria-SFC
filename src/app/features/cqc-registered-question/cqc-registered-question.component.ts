import { Component, OnInit } from '@angular/core';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { LocationService } from '../../core/services/location.service';

import { CqcRegisteredQuestion } from './cqc-regsitered-check';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
  styleUrls: ['./cqc-registered-question.component.scss']
})

export class CqcRegisteredQuestionComponent implements OnInit {

  model: CqcRegisteredQuestion = new CqcRegisteredQuestion('', '', '', '');

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

    //alert(JSON.stringify(this.model));
    this.routeQuestionCheck(this.model, this.router);
  }

  // Simple check to see which input field they enter and route to appropriate component
  routeQuestionCheck = function (input: any, router) {
    console.log(input);


    var registeredQuestionSelectedCheck = input.registeredQuestionSelected, 
        postcodeYesCheck = input.postcodeYes,
        locationIdCheck = input.locationId,
        postcodeNoCheck = input.postcodeNo;

    if (registeredQuestionSelectedCheck === 'yes') {
      if (postcodeYesCheck) {
        router.navigate(['/select-workplace']);
        console.log(postcodeYesCheck);
      }
      else if (locationIdCheck) {
        router.navigate(['/confirm-workplace-details']);
        console.log(locationIdCheck);
      }
    }
    else {
      if (postcodeNoCheck) {
        router.navigate(['/select-workplace-address']);
        console.log(postcodeNoCheck);
      }
    }
    
    
    
  }
  

  


  
}
