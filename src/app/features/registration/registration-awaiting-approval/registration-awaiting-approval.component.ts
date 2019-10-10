import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-registration-awaiting-approval',
  templateUrl: './registration-awaiting-approval.component.html',
})
export class RegistrationAwaitingApprovalComponent implements OnInit {
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.registrationService.registrationInProgress$.next(false);
  }
}
