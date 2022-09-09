import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { AccountDetailsDirective } from '@shared/directives/user/account-details.directive';

@Component({
  selector: 'app-your-details',
  templateUrl: './your-details.component.html',
})
export class YourDetailsComponent extends AccountDetailsDirective {
  constructor(
    private userService: UserService,
    private registrationService: RegistrationService,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {
    super(backService, errorSummaryService, fb, router, route);
  }

  public setBackLink(): void {
    const url = this.return ? 'confirm-details' : 'add-total-staff';
    this.backService.setBackLink({ url: ['registration', url] });
  }
  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
    this.return = this.registrationService.returnTo$.value;
    this.prefillFormIfUserDetailsExist();
  }

  protected prefillFormIfUserDetailsExist(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.prefillForm(userDetails);
        }
      }),
    );
  }

  protected setFormSubmissionLink(): string {
    return this.return ? 'confirm-details' : 'username-password';
  }

  protected save(): void {
    this.userService.updateState(this.setUserDetails());
    const url = this.setFormSubmissionLink();
    this.router.navigate(['registration', url]);
  }
}
