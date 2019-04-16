import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';
import { RegistrationTrackerError } from './../../core/model/registrationTrackerError.model';

@Component({
  selector: 'app-select-workplace',
  templateUrl: './select-workplace.component.html',
})
export class SelectWorkplaceComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  private registration: RegistrationModel;
  selectedAddressId: string;
  addressPostcode: string;
  mainService: string;
  submitted = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private registrationService: RegistrationService, private router: Router, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      workplace: ['', Validators.required],
    });

    // Watch workplace
    this.subscriptions.add(
      this.form
        .get('workplace')
        .valueChanges.subscribe(value => this.selectWorkplaceChanged(value))
    );

    this.subscriptions.add(
      this.registrationService.registration$.subscribe(registration => (this.registration = registration))
    );

    // this.resetPostcodeApi();
  }

  resetPostcodeApi() {
    const count = this.registration.locationdata.length;
    const postcode = this.registration.locationdata[0].postalCode;
    const routeArray = this.registration.userRoute['route'];

    if (count === 1) {
      if (routeArray.length >= 2) {
        this.subscriptions.add(
          this.registrationService.getLocationByPostCode(postcode).subscribe(res => {
            this.registrationService.updateState(res);
          })
        );
      }
    }
  }

  selectWorkplaceChanged(value: string): void {
    this.selectedAddressId = this.registration.locationdata[value].locationId;
    this.mainService = this.registration.locationdata[value].mainService;
  }

  onSubmit() {
    this.submitted = true;

    if (this.selectedAddressId) {
      this.save(this.selectedAddressId);
    }
  }

  save(selectedAddressId) {
    this.subscriptions.add(
      this.registrationService.getLocationByLocationId(selectedAddressId).subscribe(
        (data: RegistrationModel) => {
          if (data.success === 1) {
            this.registrationService.updateState(data);
            this.router.navigate(['/select-main-service']);
          }
        },
        (err: RegistrationTrackerError) => {

        },
        () => {
          console.log('Get location by postcode complete');
        }
      )
    );
  }

  setRegulatedCheckFalse(data) {
    // clear default location data
    data.locationdata = [{}];
    data.locationdata[0]['isRegulated'] = false;
  }

  workplaceNotFound() {
    this.addressPostcode = this.registration.locationdata[0].postalCode;

    this.subscriptions.add(
      this.registrationService.getAddressByPostCode(this.addressPostcode).subscribe((data: RegistrationModel) => {
        if (data.success === 1) {
          this.setRegulatedCheckFalse(data);
          this.registrationService.updateState(data);
          this.router.navigate(['/select-workplace-address']);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
