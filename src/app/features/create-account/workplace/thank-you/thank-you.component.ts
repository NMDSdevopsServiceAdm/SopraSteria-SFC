import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
})
export class ThankYouComponent implements OnInit {
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.registrationService.registrationInProgress$.next(false);
  }
}
