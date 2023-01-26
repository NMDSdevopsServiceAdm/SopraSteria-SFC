import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetailsDirective {
  private activationToken: string;
  public callToActionLabel = 'Save and return';

  constructor(
    private createAccountService: CreateAccountService,
    protected route: ActivatedRoute,

    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {
    super(backLinkService, errorSummaryService, fb, router, route);
  }

  protected init() {
    this.setupSubscription();
    this.activationToken = this.route.snapshot.params.activationToken;
    this.return = this.createAccountService.returnTo$.value;
    this.setBackLink();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.createAccountService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.prefillForm(userDetails);
        }
      }),
    );
  }

  protected save(): void {
    this.createAccountService.userDetails$.next(this.setUserDetails());
    this.router.navigate(this.return.url);
  }
  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
