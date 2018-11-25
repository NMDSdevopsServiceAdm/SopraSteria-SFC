import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-select-workplace-address',
  templateUrl: './select-workplace-address.component.html',
  styleUrls: ['./select-workplace-address.component.scss']
})
export class SelectWorkplaceAddressComponent implements OnInit {
  selectWorkplaceAddressForm: FormGroup;
  registration: RegistrationModel[];
  selectedAddress: string;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectWorkplaceAddressForm = this.fb.group({
      selectWorkplaceAddressSelected: ''
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceAddressForm.get('selectWorkplaceAddressSelected').valueChanges.subscribe(
      value => this.selectWorkplaceAddressChanged(value)
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);
  }

  selectWorkplaceAddressChanged(value: string): void {
    debugger;
    this.selectedAddress = this.registration[value];
  }

  save() {
    //this._registrationService.getLocationByLocationId(this.selectedAddressId);
    console.log(this.registration[this.selectedAddress]);
    debugger;
    this._registrationService.updateState([this.selectedAddress]);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/select-main-service']);
  }

}
