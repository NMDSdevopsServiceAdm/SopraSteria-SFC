import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { RegistrationTrackerError } from './../../core/model/registrationTrackerError.model';

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
  postcodeValue: string;
  locationdata = [];

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  postcodeApiError: boolean;
  selectAddressMessage: boolean;

  currentSection: number;
  lastSection: number;
  backLink: string;


  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectAddressMessage = false;
    this.postcodeApiError = false;

    this.selectWorkplaceAddressForm = this.fb.group({
      selectWorkplaceAddressSelected: ['', [Validators.required]],
      postcodeInput: ['', Validators.maxLength(8)]
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceAddressForm.get('selectWorkplaceAddressSelected').valueChanges.subscribe(
      value => {

        this.selectWorkplaceAddressChanged(value);
      }
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    this.editPostcode = false;


    this.setSectionNumbers();

    // Check if postcode already exists on load
    this.checkExistingPostcode(this.registration);

    // set not registered
    this.setRegulatedCheckFalse(this.registration);
  }

  setRegulatedCheckFalse(data) {
    // clear default location data
    data.locationdata = [{}];
    data.locationdata[0]['isRegulated'] = false;
  }

  checkExistingPostcode(data) {

    if (data.locationdata[0].postalCode) {
      this.postcodeValue = data.locationdata[0].postalCode;
    }
    else if (data.postcodedata[0].postalCode) {
      this.postcodeValue = data.postcodedata[0].postalCode;
    }

    if ((data.locationdata.length <= 1) && data.locationdata[0].postalCode) {
      const existingPostcode = data.locationdata[0].postalCode;
      this.updatePostcode(existingPostcode);
    }
  }

  selectWorkplaceAddressChanged(value: string): void {
    this.selectedAddress = this.registration.postcodedata[value];
    this.selectAddressMessage = false;
  }

  save() {

    if (!this.selectedAddress) {
      this.selectAddressMessage = true;
    }
    else {

      const locationdata = [this.selectedAddress];

      const postcodeObj = {
        locationdata
      };

      postcodeObj.locationdata[0]['isRegulated'] = false;

      this.updateSectionNumbers(postcodeObj);

      this._registrationService.updateState(postcodeObj);

      if (this.registration.locationdata[0].locationName === '') {

        this.router.navigate(['/enter-workplace-address']);
      }
      else {
        this.router.navigate(['/select-main-service']);
      }

    }

  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;
    this.lastSection = 8;
  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute || {};
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = (this.registration.userRoute && this.registration.userRoute['route']) || [];
    data.userRoute['route'].push('/select-workplace-address');
  }

  postcodeChange() {
    this.editPostcode = true;
  }

  updatePostcode(existingPostcode) {
    if (!existingPostcode) {
      this.postcodeValue = this.selectWorkplaceAddressForm.get('postcodeInput').value;
    }
    else {
      this.postcodeValue = existingPostcode;
    }

    this._registrationService.getUpdatedAddressByPostCode(this.postcodeValue)
      .subscribe(
        (data: RegistrationModel) => {
          this.setRegulatedCheckFalse(data);
          this._registrationService.updateState(data);
        },
        (err: any) => {
          //this.nonCqcPostcodeApiError = err.friendlyMessage;
          this.postcodeApiError = true;
        },
        () => {
          console.log('Updated locations by postcode complete');
          this.postcodeApiError = false;
        }
      );

    this.editPostcode = false;
  }

}
