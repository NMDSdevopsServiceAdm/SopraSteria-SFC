
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
  mainService: string;

  cqcPostcodeApiError: string;
  cqclocationApiError: string;
  nonCqcPostcodeApiError: string;

  currentSection: number;
  lastSection: number;
  prevPage: string;

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

  setSectionNumbers() {
    this.prevPage = this.registration.locationdata[0].prevPage;
    const currentpage = this.registration.locationdata[0].currentPage;

    this.currentSection = currentpage + 1;


    if ((this.prevPage === 'registered-question') && (this.currentSection === 2)) {
      //this.currentSection = '2';
      this.lastSection = 7;
    }
  }

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
          data.locationdata[0].prevPage = 'select-workplace';
          data.locationdata[0].currentPage = this.currentSection;

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

}
