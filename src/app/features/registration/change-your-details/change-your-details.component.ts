import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { AccountDetails } from '@features/account/account-details/account-details';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';
  private previousAndReturnRoute: any[] = ['/registration/confirm-account-details'];

  constructor(
    private userService: UserService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, fb, router);
  }

  protected init() {
    this.setupSubscription();
    this.setBackLink();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.prefillForm(userDetails);
        }
      }),
    );
  }

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    this.router.navigate(this.previousAndReturnRoute);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: this.previousAndReturnRoute });
  }
}
