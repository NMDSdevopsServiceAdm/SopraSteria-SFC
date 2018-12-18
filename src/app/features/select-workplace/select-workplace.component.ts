
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { RegistrationTrackerError } from './../../core/model/registrationTrackerError.model';


@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
  styleUrls: ['./select-workplace.component.scss']
})
export class SelectWorkplaceComponent implements OnInit {
  selectWorkplaceForm: FormGroup;
  registration: RegistrationModel;
  selectedAddressId: string;
  addressPostcode: string;
  mainService: string;

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  nonCqcPostcodeApiError: string;

  currentSection: number;
  lastSection: number;
  backLink: string;

  isSubmitted = false;

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.selectWorkplaceForm = this.fb.group({
      selectWorkplaceSelected: ['', Validators.required]
    });

    // Watch selectWorkplaceSelected
    this.selectWorkplaceForm.get('selectWorkplaceSelected').valueChanges.subscribe(
      value => this.selectWorkplaceChanged(value)
    );

    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    this.setSectionNumbers();
  }

  clickBack() {
    const routeArray = this.registration.userRoute.route;
    this.currentSection = this.registration.userRoute.currentPage;
    this.currentSection = this.currentSection - 1;
    debugger;
    this.registration.userRoute.route.splice(-1);
    debugger;

    //this.updateSectionNumbers(this.registration);
    this.registration['userRoute'] = this.registration.userRoute;
    this.registration.userRoute['currentPage'] = this.currentSection;
    //this.registration.userRoute['route'] = this.registration.userRoute['route'];
    this._registrationService.updateState(this.registration);

    debugger;
    this.router.navigate([this.backLink]);
  }

  setSectionNumbers() {
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];

    this.currentSection = this.currentSection + 1;
    this.lastSection = 8;
  }

  // && (this.currentSection === 2)

  selectWorkplaceChanged(value: string): void {
    this.selectedAddressId = this.registration.locationdata[value].locationId;
    this.mainService = this.registration.locationdata[value].mainService;

  }

  onSubmit() {
    this.isSubmitted = true;


    if (this.selectedAddressId) {

      this.save(this.selectedAddressId);
    }
  }

  save(selectedAddressId) {

    this._registrationService.getLocationByLocationId(selectedAddressId)
    .subscribe(
      (data: RegistrationModel) => {
        if (data.success === 1) {

          this.updateSectionNumbers(data);

          this._registrationService.updateState(data);
          this._registrationService.routingCheck(data);
        }
      },
      (err: RegistrationTrackerError) => {

        console.log(err);
        this.cqcPostcodeApiError = err.friendlyMessage;
        //this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
      },
      () => {
        console.log('Get location by postcode complete');
      }
    );
  }

  updateSectionNumbers(data) {
    debugger;
    data['userRoute'] = this.registration.userRoute;
    data.userRoute['currentPage'] = this.currentSection;
    data.userRoute['route'] = this.registration.userRoute['route'];
    data.userRoute['route'].push('/select-workplace');


    // data.userRoute.currentPage = this.currentSection;
    // data.userRoute.route.push('/select-workplace');

    console.log(data);
    console.log(this.registration);
    debugger;
  }

  workplaceNotFound() {
    this.addressPostcode = this.registration.locationdata[0].postalCode;
    debugger;

    this._registrationService.getAddressByPostCode(this.addressPostcode).subscribe(
      (data: RegistrationModel) => {
        if (data.success === 1) {
          debugger;
          this.updateSectionNumbers(data);
          //data = data.postcodedata;
          this._registrationService.updateState(data);
          //this.routingCheck(data);
        }
      },
      (err: RegistrationTrackerError) => {
        debugger;
        console.log(err);
        this.nonCqcPostcodeApiError = err.friendlyMessage;
        this.setCqcRegPostcodeMessage(this.cqcRegisteredPostcode);
      },
      () => {
        console.log('Get location by postcode complete');
        this.router.navigate(['/select-workplace-address']);
      }
    );
  }

}
