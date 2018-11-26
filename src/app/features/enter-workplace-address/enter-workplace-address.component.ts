import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-enter-workplace-address',
  templateUrl: './enter-workplace-address.component.html',
  styleUrls: ['./enter-workplace-address.component.scss']
})
export class EnterWorkplaceAddressComponent implements OnInit {
  enterWorkplaceAddressForm: FormGroup;
  registration: RegistrationModel[];

  constructor(private _registrationService: RegistrationService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    this.enterWorkplaceAddressForm = this.fb.group({
      postcodeInput: ['', [Validators.required, Validators.maxLength(8)]],
      address1Input: ['', [Validators.required, Validators.maxLength(40)]],
      address2Input: ['', [Validators.required, Validators.maxLength(40)]],
      townCityInput: ['', [Validators.required, Validators.maxLength(40)]],
      countyInput: ['', [Validators.required, Validators.maxLength(40)]],
      wpNameInput: ['', [Validators.required, Validators.maxLength(120)]]
    });

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
  }

  save() {
    let postcodeValue = this.enterWorkplaceAddressForm.get('postcodeInput').value;
    let address1Value = this.enterWorkplaceAddressForm.get('address1Input').value;
    let address2Value = this.enterWorkplaceAddressForm.get('address2Input').value;
    let townCityValue = this.enterWorkplaceAddressForm.get('townCityInput').value;
    let countyValue = this.enterWorkplaceAddressForm.get('countyInput').value;
    let wpNameValue = this.enterWorkplaceAddressForm.get('wpNameInput').value;

    //this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
    debugger;

    this.registration[0]['postalCode'] = postcodeValue;
    this.registration[0]['addressLine1'] = address1Value;
    this.registration[0]['addressLine2'] = address2Value;
    this.registration[0]['townCity'] = townCityValue;
    this.registration[0]['county'] = countyValue;
    this.registration[0]['locationName'] = wpNameValue;

    console.log(this.registration.length);

    const updateRegistration = this.registration[0];

    this._registrationService.updateState([updateRegistration]);
    debugger;
    //this._registrationService.routingCheck(this.registration);
    this.router.navigate(['/select-main-service']);

  }

}
