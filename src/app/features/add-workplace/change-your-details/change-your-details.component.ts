import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { AccountDetails } from '@features/account/account-details/account-details';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent extends AccountDetails {
  private flow: string;
  public callToActionLabel = 'Continue';
  public locationAddress: LocationAddress;

  constructor(
    private createAccountService: CreateAccountService,
    private workplaceService: WorkplaceService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(backService, errorSummaryService, formBuilder, router);
  }

  protected init() {
    this.setupSubscription();
    this.return = this.createAccountService.returnTo$.value;
    this.flow = '/add-workplace';
    this.setBackLink();
  }

  private setupSubscription(): void {
    this.subscriptions.add(
      combineLatest([this.workplaceService.selectedLocationAddress$, this.createAccountService.userDetails$]).subscribe(
        ([locationAddress, userDetails]) => {
          this.locationAddress = locationAddress;

          if (userDetails) {
            this.prefillForm(userDetails);
          }
        },
      ),
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
