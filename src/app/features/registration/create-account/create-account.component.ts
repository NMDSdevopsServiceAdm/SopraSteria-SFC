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

    this.registrationService.resetService();
    this.setStartLink();
  }

  public setStartLink(): Array<string> {
    return this.createAccountNewDesign
      ? ['/registration', 'new-regulated-by-cqc']
      : ['/registration', 'regulated-by-cqc'];
  }
}
