import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { RegistrationService } from '@core/services/registration.service';

@Component({
  selector: 'app-confirm-details',
  templateUrl: './confirm-details.component.html',
})
export class ConfirmDetailsComponent implements OnInit {
  constructor(private registrationService: RegistrationService, protected backService: BackService) {}

  ngOnInit(): void {
    console.log('ConfirmDetails component created');
  }
}
