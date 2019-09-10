import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  constructor(private backService: BackService, private registrationService: RegistrationService) {}

  ngOnInit() {
    this.resetRegistration();
    this.backService.setBackLink({ url: ['/login'] });
  }

  private resetRegistration(): void {
    this.registrationService.registrationInProgress$.next(false);
    this.registrationService.locationAddresses$.next(null);
    this.registrationService.selectedLocationAddress$.next(null);
    this.registrationService.selectedWorkplaceService$.next(null);
    this.registrationService.loginCredentials$.next(null);
    this.registrationService.securityDetails$.next(null);
    this.registrationService.isRegulated$.next(null);
    this.registrationService.returnTo$.next(null);
  }
}
