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
  locationdata = [];

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  nonCqcPostcodeApiError: string;

  currentSection: number;
  lastSection: number;
  backLink: string;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectWorkplaceAddressForm = this.fb.group({
      selectWorkplaceAddressSelected: '',
      postcodeInput: ['', Validators.maxLength(8)]
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceAddressForm.get('selectWorkplaceAddressSelected').valueChanges.subscribe(
      value => {

        this.selectWorkplaceAddressChanged(value);
      }
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);
    console.log(this.registration);

    this.editPostcode = false;

    this.setSectionNumbers();
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;
    this.lastSection = 8;
  }

  selectWorkplaceAddressChanged(value: string): void {
    this.selectedAddress = this.registration.postcodedata[value];
  }

  save() {
    const locationdata = [this.selectedAddress];

    const postcodeObj = {
      locationdata
    };

    this.locationdata.push(postcodeObj);

    this.updateSectionNumbers(this.locationdata[0]);

    this._registrationService.updateState(this.locationdata[0]);

    if (this.registration.locationdata[0].locationName === '') {

      this.router.navigate(['/enter-workplace-address']);
    }
    else {
      this.router.navigate(['/select-main-service']);
    }

  }

  updateSectionNumbers(data) {
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/select-workplace-address');


    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');

    console.log(data);
    console.log(this.registration);
  }

  postcodeChange() {
    this.editPostcode = true;
  }

  updatePostcode() {
    const postcodeValue = this.selectWorkplaceAddressForm.get('postcodeInput').value;

    this._registrationService.getUpdatedAddressByPostCode(postcodeValue)
      .subscribe(
        (data: RegistrationModel) => {
          this._registrationService.updateState(data);

          // this.router.navigate(['/select-workplace-address']);

        },
        (err: any) => console.log(err),
        () => {
          console.log('Updated locations by postcode complete');
          console.log(this._registrationService);
        }
      );

    this.editPostcode = false;
    //console.log(this.registration);
  }

}
