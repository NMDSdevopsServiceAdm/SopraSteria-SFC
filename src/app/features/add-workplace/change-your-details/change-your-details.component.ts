import { AccountDetails } from '@features/account/account-details/account-details';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Continue';
  private flow: string;

  constructor(
    private createAccountService: CreateAccountService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init() {
    this.setupSubscription();
    this.return = this.createAccountService.returnTo$.value;
    this.flow = '/add-workplace';
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
    this.router.navigate([`${this.flow}/confirm-account-details`]);
  }

  protected setBackLink(): void {
    this.back = this.return ? this.return : { url: [`${this.flow}/create-user-account`] };
    this.backService.setBackLink(this.back);
  }
}
