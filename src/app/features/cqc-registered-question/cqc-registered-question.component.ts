import { Component, OnInit } from '@angular/core';
//import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { LocationService } from '../../core/services/location.service';

//import { allLocations } from '../../core/model/location.model';


@Component({
  selector: 'app-cqc-registered-question',
  templateUrl: './cqc-registered-question.component.html',
  styleUrls: ['./cqc-registered-question.component.scss']
})

export class CqcRegisteredQuestionComponent implements OnInit {

  //
  allLocations: Location[];

  constructor(private locationService: LocationService, private router: Router) { }

  ngOnInit() {

    //Call getAllLocations() from location.service
    this.locationService.getAllLocations()
      .subscribe(
        (data: Location[]) => this.allLocations = data,
        (err: any) => console.log(err),
        () => console.log('All done getting locations')
      );
  }

}
