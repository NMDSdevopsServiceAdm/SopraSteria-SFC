import { AccountDetails } from '@features/account/account-details/account-details';
import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  public callToActionLabel = 'Save and return';
  private activationToken: string;
  private previousAndReturnRoute: any[];

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
    this.previousAndReturnRoute = ['/activate-account' , this.activationToken, 'confirm-account-details'];
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

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.email,
        fullname: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected save(): void {
    this.createAccountService.userDetails$.next(this.setUserDetails());
    this.navigateToNextRoute();
  }

  protected navigateToNextRoute(): void {
    this.router.navigate(this.previousAndReturnRoute);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: this.previousAndReturnRoute });
  }
}
