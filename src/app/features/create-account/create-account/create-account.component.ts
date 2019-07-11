import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent extends AccountDetails {
  public callToActionLabel = 'Save user account';

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    private createAccountService: CreateAccountService
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected save() {
    this.createAccountService.accountDetails$.next(this.setUserDetails());
    this.router.navigate(['/create-account/create-username']); // TODO will build in seperate pr
  }
}
