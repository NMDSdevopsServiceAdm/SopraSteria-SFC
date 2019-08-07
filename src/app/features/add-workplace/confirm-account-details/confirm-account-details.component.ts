import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateAccountRequest, CreateAccountResponse } from '@core/model/account.model';
import { Roles } from '@core/model/roles.enum';
import { AddWorkplaceFlow, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BackService } from '@core/services/back.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ConfirmAccountDetails } from '@features/account/confirm-account-details/confirm-account-details';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetails {
  protected actionType = 'Account creation';
  protected flow = '/add-workplace';

  constructor(
    private backService: BackService,
    private createAccountService: CreateAccountService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private workplaceService: WorkplaceService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder
  ) {
    super(errorSummaryService, formBuilder);
  }

  protected init() {
    this.setupSubscriptions();
    this.setBackLink();
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      combineLatest(
        this.createAccountService.userDetails$,
        this.workplaceService.selectedLocationAddress$,
        this.workplaceService.selectedWorkplaceService$
      ).subscribe(([userDetails, locationAddress, workplaceService]) => {
        this.userDetails = userDetails;
        this.locationAddress = locationAddress;
        this.service = workplaceService;
        this.setAccountDetails();
      })
    );
  }

  private setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: { url: [`${this.flow}/change-your-details`] },
      },
      {
        label: 'Job title',
        data: this.userDetails.jobTitle,
      },
      {
        label: 'Email address',
        data: this.userDetails.email,
      },
      {
        label: 'Contact phone',
        data: this.userDetails.phone,
      },
    ];
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/create-user-account`] });
  }

  public addWorkplace(): void {
    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(
          this.establishmentService.primaryWorkplace.uid,
          this.workplaceService.generateAddWorkplaceRequest(this.locationAddress, this.service)
        )
        .subscribe(
          (response: CreateAccountResponse) => this.createAccount(response.establishmentUid),
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }

  private generateCreateAccountRequest(): CreateAccountRequest {
    return {
      email: this.userDetails.email,
      fullname: this.userDetails.fullname,
      jobTitle: this.userDetails.jobTitle,
      phone: this.userDetails.phone,
      role: Roles.Read,
    };
  }

  private createAccount(establishmentUid: string) {
    return this.createAccountService
      .createAccount(establishmentUid, this.generateCreateAccountRequest())
      .pipe(take(1))
      .subscribe(
        (response: AddWorkplaceResponse) => {
          this.workplaceService.newWorkplaceUid$.next(response.establishmentUid);
          this.workplaceService.addWorkplaceFlow$.next(AddWorkplaceFlow.CQC_WITH_USER);
          this.router.navigate([`${this.flow}/complete`]);
        },
        (error: HttpErrorResponse) => this.onError(error)
      );
  }

  public onSetReturn(): void {
    this.createAccountService.setReturnTo({
      url: [`${this.flow}/confirm-account-details`],
    });
  }
}
