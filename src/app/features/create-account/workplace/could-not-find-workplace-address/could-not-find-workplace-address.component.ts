import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-could-not-find-workplace-address',
  templateUrl: './could-not-find-workplace-address.component.html',
})
export class CouldNotFindWorkplaceAddressComponent implements OnInit {
  public invalidPostcodeEntered: string;

  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.invalidPostcodeEntered = this.registrationService.invalidPostcodeEntered$.value;
  }
}
