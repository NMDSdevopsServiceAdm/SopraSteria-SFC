import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-registration-complete',
  templateUrl: './registration-complete.component.html',
})
export class RegistrationCompleteComponent implements OnInit {
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.registrationService.registrationInProgress$.next(false);
  }
}
