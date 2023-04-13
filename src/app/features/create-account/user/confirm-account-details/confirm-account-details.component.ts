import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationPayload } from '@core/model/registration.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { ConfirmAccountDetailsDirective } from '@shared/directives/user/confirm-account-details.directive';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
})
export class ConfirmAccountDetailsComponent extends ConfirmAccountDetailsDirective {
  public flow: any;
  constructor(
    private backService: BackService,
    private registrationService: RegistrationService,
    private router: Router,
    private userService: UserService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
  ) {
    super(errorSummaryService, formBuilder, route);
  }

  protected init(): void {
    this.flow = this.route.snapshot.parent.url[0].path;

    this.resetReturnTo();
    this.setupSubscriptions();
    this.setBackLink();
    this.subscriptions.add(
      this.registrationService.isCqcRegulated$.subscribe((value) => {
        this.slectedCqcValue = value;
      }),
    );
  }

  protected setupSubscriptions(): void {
    this.subscriptions.add(
      combineLatest([
        this.userService.userDetails$,
        this.registrationService.selectedLocationAddress$,
        this.registrationService.selectedWorkplaceService$,
        this.registrationService.loginCredentials$,
        this.registrationService.securityDetails$,
      ]).subscribe(([userDetails, locationAddress, service, loginCredentials, securityDetails]) => {
        this.userDetails = userDetails;
        this.locationAddress = locationAddress;
        this.service = service;
        this.loginCredentials = loginCredentials;
        this.securityDetails = securityDetails;
        this.setAccountDetails();
      }),
    );
  }

  public setAccountDetails(): void {
    this.userInfo = [
      {
        label: 'Full name',
        data: this.userDetails.fullname,
        route: { url: ['/registration', this.flow, 'add-user-details'] },
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
        label: 'Phone number',
        data: this.userDetails.phone,
      },
    ];

    this.loginInfo = [
      {
        label: 'Username',
        data: this.loginCredentials.username,
        route: { url: ['/registration/confirm-details/username-password'] },
      },
      {
        label: 'Password',
        data: this.loginCredentials.password,
      },
    ];

    this.securityInfo = [
      {
        label: 'Security question',
        data: this.securityDetails.securityQuestion,
        route: { url: ['/registration/confirm-details/create-security-question'] },
      },
      {
        label: 'Answer',
        data: this.securityDetails.securityQuestionAnswer,
      },
    ];
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/create-security-question'] });
  }

  private generatePayload(): RegistrationPayload {
    const payload: any = this.locationAddress;
    payload.locationId = this.service.isCQC ? this.locationAddress.locationId : null;
    payload.mainService = this.service.name;
    payload.mainServiceOther = this.service.otherName ? this.service.otherName : null;
    payload.isRegulated = this.service.isCQC === null ? this.slectedCqcValue : this.service.isCQC;
    payload.user = this.userDetails;
    payload.user.username = this.loginCredentials.username;
    payload.user.password = this.loginCredentials.password;
    payload.user.securityQuestion = this.securityDetails.securityQuestion;
    payload.user.securityQuestionAnswer = this.securityDetails.securityQuestionAnswer;
    return payload;
  }

  protected save(): void {
    this.subscriptions.add(
      this.registrationService.postRegistration(this.generatePayload()).subscribe(
        (registration) =>
          registration.userstatus === 'PENDING'
            ? this.router.navigate(['/registration/thank-you'])
            : this.router.navigate(['/registration/complete']),
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  public onSetReturn(): void {
    this.registrationService.setReturnTo({
      url: ['/registration/confirm-details'],
    });
  }

  private resetReturnTo(): void {
    this.registrationService.returnTo$.next(null);
  }
}
