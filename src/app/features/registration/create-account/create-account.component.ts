import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent implements OnInit {
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.resetRegistration();
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
