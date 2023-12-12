import { Component } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
})
export class ThankYouComponent {
  constructor(public registrationService: RegistrationService, private userService: UserService) {
    this.registrationService.registrationInProgress$.next(false);
    this.registrationService.resetService();
    this.userService.resetUserDetails();
  }
}
