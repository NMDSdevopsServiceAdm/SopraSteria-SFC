import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  registration: RegistrationModel;
  selectedAddress: string;
  editPostcode: boolean;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectWorkplaceAddressForm = this.fb.group({
      selectWorkplaceAddressSelected: '',
      postcodeInput: ['', Validators.maxLength(8)]
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceAddressForm.get('selectWorkplaceAddressSelected').valueChanges.subscribe(
      value => this.selectWorkplaceAddressChanged(value)
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);

    this.editPostcode = false;
  }

  selectWorkplaceAddressChanged(value: string): void {
    this.selectedAddress = this.registration[value];
  }

  save() {
    //this._registrationService.getLocationByLocationId(this.selectedAddressId);
    //console.log(this.registration[this.selectedAddress]);
    this._registrationService.updateState([this.selectedAddress]);

    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/select-main-service']);
  }

  postcodeChange() {
    this.editPostcode = true;
  }

  updatePostcode() {
    const postcodeValue = this.selectWorkplaceAddressForm.get('postcodeInput').value;

    this._registrationService.getUpdatedAddressByPostCode(postcodeValue);

    this.editPostcode = false;
    //console.log(this.registration);
  }

}
