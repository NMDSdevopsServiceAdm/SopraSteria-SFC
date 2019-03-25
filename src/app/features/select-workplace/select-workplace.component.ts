
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MessageService } from '../../core/services/message.service';
import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { RegistrationTrackerError } from './../../core/model/registrationTrackerError.model';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
  styleUrls: ['./select-workplace.component.scss']
})
export class SelectWorkplaceComponent implements OnInit, OnDestroy {
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
  secondItem: number;

  isSubmitted = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private _registrationService: RegistrationService, private router: Router, private fb: FormBuilder, private messageService: MessageService) { }

  ngOnInit() {
    this.selectWorkplaceForm = this.fb.group({
      selectWorkplaceSelected: ['', Validators.required]
    });

    // Watch selectWorkplaceSelected
    this.subscriptions.add(
      this.selectWorkplaceForm.get('selectWorkplaceSelected').valueChanges.subscribe(
        value => this.selectWorkplaceChanged(value)
      )
    );

    this.subscriptions.add(
      this._registrationService.registration$.subscribe(registration => this.registration = registration)
    );

    this.resetPostcodeApi();
    this.setSectionNumbers();

    debugger;
  }

  resetPostcodeApi() {
    const count = this.registration.locationdata.length;
    const postcode = this.registration.locationdata[0].postalCode;

    if (count === 1) {
      this.subscriptions.add(
        this._registrationService.getLocationByPostCode(postcode).subscribe(res => {
          this._registrationService.updateState(res);
        })
      );
    }
    debugger;
  }

  clickBack() {
    debugger;
    if (this.registration.userRoute) {
      const routeArray = this.registration.userRoute.route;
      this.currentSection = this.registration.userRoute.currentPage;
      this.currentSection = this.currentSection - 1;
      this.registration.userRoute.route.splice(-1);

      //this.updateSectionNumbers(this.registration);
      this.registration['userRoute'] = this.registration.userRoute;
      this.registration.userRoute['currentPage'] = this.currentSection;
      //this.registration.userRoute['route'] = this.registration.userRoute['route'];
      this._registrationService.updateState(this.registration);

      this.router.navigate([this.backLink]);
    }
    else {
      this.updateSectionNumbers(this.registration);
      this.clickBack();
    }

  }

  setSectionNumbers() {
    debugger;
    this.currentSection = this.registration.userRoute.currentPage;
    this.backLink = this.registration.userRoute.route[this.currentSection - 1];
    this.secondItem = 1;

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

    this.subscriptions.add(
      this._registrationService.getLocationByLocationId(selectedAddressId).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {

            this.updateSectionNumbers(data);

            this._registrationService.updateState(data);
            //this._registrationService.routingCheck(data);
            this.router.navigate(['/select-main-service']);
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
      )
    );
  }

  updateSectionNumbers(data?) {
    debugger;
    if (this.registration.userRoute) {
      data['userRoute'] = this.registration.userRoute;
      data.userRoute['currentPage'] = this.currentSection;
      data.userRoute['route'] = this.registration.userRoute['route'];
      data.userRoute['route'].push('/select-workplace');
    }
    else {
      debugger;

      data['userRoute'] = {
        currentPage: this.currentSection,
        route: []
      };

      data.userRoute['route'].push('/registered-question');
      data.userRoute['route'].push('/select-workplace');

      this._registrationService.updateState(data);

    }

  }

  setRegulatedCheckFalse(data) {
    // clear default location data
    data.locationdata = [{}];
    data.locationdata[0]['isRegulated'] = false;
  }

  workplaceNotFound() {
    this.addressPostcode = this.registration.locationdata[0].postalCode;

    this.subscriptions.add(
      this._registrationService.getAddressByPostCode(this.addressPostcode).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.updateSectionNumbers(data);
            this.setRegulatedCheckFalse(data);
            //data = data.postcodedata;
            this._registrationService.updateState(data);
            //this.routingCheck(data);
            this.router.navigate(["/select-workplace-address"])
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.messageService.clearAll()
  }
}
