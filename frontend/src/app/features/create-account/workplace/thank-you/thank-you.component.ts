import { Component } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-thank-you-create-account',
    templateUrl: './thank-you.component.html',
    standalone: false
})
export class ThankYouComponent {
  constructor(public registrationService: RegistrationService, private userService: UserService) {
    this.registrationService.registrationInProgress$.next(false);
    this.registrationService.resetService();
    this.userService.resetUserDetails();
  }
}
