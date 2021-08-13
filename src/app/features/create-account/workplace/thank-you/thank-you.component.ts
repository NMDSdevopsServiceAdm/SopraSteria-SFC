import { Component } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
})
export class ThankYouComponent {
  constructor(private registrationService: RegistrationService) {
    this.registrationService.registrationInProgress$.next(false);
  }
}
