import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-your-details',
  templateUrl: './your-details.component.html',
})
export class YourDetailsComponent extends AccountDetailsDirective {
  public createAccountNewDesign: boolean;

  constructor(
    private userService: UserService,
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  public setBackLink(): void {
    const url = this.createAccountNewDesign ? 'new-select-main-service' : 'confirm-workplace-details';
    this.backService.setBackLink({ url: ['registration', url] });
  }

  protected async init(): Promise<void> {
    await this.featureFlagsService.configCatClient.forceRefreshAsync();
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
    this.return = this.registrationService.returnTo$.value;
  }

  protected setFormSubmissionLink(): string {
    if (this.createAccountNewDesign) {
      return this.return ? 'confirm-details' : 'username-password';
    }
    return this.return ? 'confirm-account-details' : 'username-password';
  }

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    const url = this.setFormSubmissionLink();
    this.router.navigate(['registration', url]);
  }
}
