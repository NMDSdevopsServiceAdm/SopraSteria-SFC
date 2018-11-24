import { Component, OnInit } from '@angular/core';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-confirm-workplace-details',
  templateUrl: './confirm-workplace-details.component.html',
  styleUrls: ['./confirm-workplace-details.component.scss']
})
export class ConfirmWorkplaceDetailsComponent implements OnInit {
  registration: RegistrationModel[];

  constructor(private _registrationService: RegistrationService) {}

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
  }

}


