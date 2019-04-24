import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { LocationAddress } from '@core/model/location-address.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registration-complete',
  templateUrl: './registration-complete.component.html'
})
export class RegistrationCompleteComponent implements OnInit, OnDestroy {
  private isRegulated: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private registrationService: RegistrationService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.registrationService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => this.isRegulated = locationAddress.isRegulated || false
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
