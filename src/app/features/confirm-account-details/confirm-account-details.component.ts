import { Component, OnInit } from '@angular/core';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-confirm-account-details',
  templateUrl: './confirm-account-details.component.html',
  styleUrls: ['./confirm-account-details.component.scss']
})
export class ConfirmAccountDetailsComponent implements OnInit {
  registration: RegistrationModel[];

  constructor(private _registrationService: RegistrationService) { }

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
  }

}
