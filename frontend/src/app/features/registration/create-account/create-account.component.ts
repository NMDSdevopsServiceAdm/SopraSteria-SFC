import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent implements OnInit {
  constructor(private registrationService: RegistrationService, private userService: UserService) {}

  ngOnInit(): void {
    this.registrationService.resetService();
    this.userService.resetUserDetails();
  }
}
