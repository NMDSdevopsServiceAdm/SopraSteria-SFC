import { Component, OnInit } from '@angular/core';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { FormGroup, Validators, FormControl } from '@angular/forms';

import { LocationService } from '../../core/services/location.service';
 // import { ApiService } from './api.service';

//import { CqcRegisteredCheck } from './cqc-regsitered-check';

@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
  styleUrls: ['./cqc-registered-question.component.scss']
})

export class CqcRegisteredQuestionComponent {

  //questionCheck = new CqcRegisteredCheck('', '');

  constructor(private locationService: LocationService) { }

  ngOnInit() {
    this.locationService.getLocations();
  }

  /*
  submitted = false;

  getLocation() {
    return this.http.get('<!--https://api.cqc.org.uk/public/v1/locations-->');

    //1-1000210669 testable locationID
    //1-1000401911
  }

  onSubmit() {
    this.submitted = true;
  }
  */
  
}
