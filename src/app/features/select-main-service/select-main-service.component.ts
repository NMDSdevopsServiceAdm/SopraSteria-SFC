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
  registration: RegistrationModel[];
  selectedAddressId: string;
  //storeCopy: RegistrationModel;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.SelectMainServiceForm = this.fb.group({
      mainServiceSelected: ''
    });

    // Watch mainServiceSelected
    this.SelectMainServiceForm.get('mainServiceSelected').valueChanges.subscribe(
      value => this.selectMainServiceChanged(value)
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);
  }

  selectMainServiceChanged(value: string): void {

    this.registration[0].mainService = value;

    console.log(this.registration[0]);
    
  }

  save() {
    //routerLink = "/confirm-workplace-details"
    console.log(this.registration);
    this._registrationService.updateState(this.registration);
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/confirm-workplace-details']);
  }

}
