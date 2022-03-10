import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent implements OnInit {
  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.registrationService.resetService();
  }
}
