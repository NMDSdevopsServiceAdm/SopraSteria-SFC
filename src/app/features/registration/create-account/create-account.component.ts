import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent implements OnInit {
  public createAccountNewDesign: boolean;

  constructor(private registrationService: RegistrationService, private featureFlagsService: FeatureFlagsService) {}

  async ngOnInit(): Promise<void> {
    await this.featureFlagsService.configCatClient.forceRefreshAsync();
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );

    this.resetRegistration();
    this.setStartLink();
  }

  public setStartLink(): Array<string> {
    return this.createAccountNewDesign
      ? ['/registration', 'new-regulated-by-cqc']
      : ['/registration', 'regulated-by-cqc'];
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
