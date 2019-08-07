import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  private activationToken: string;
  public callToActionLabel = 'Save and return';

  constructor(
    private createAccountService: CreateAccountService,
    private route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, fb, router);
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
      })
    );
  }

  protected save(): void {
    this.createAccountService.userDetails$.next(this.setUserDetails());
    this.router.navigate(this.return.url);
  }

  protected setBackLink(): void {
    this.backService.setBackLink(this.return);
  }
}
