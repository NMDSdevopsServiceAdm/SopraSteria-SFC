import { Component, OnInit } from '@angular/core';

import { RegistrationService } from '../../core/services/registration.service';
import { RegistrationModel } from '../../core/model/registration.model';

@Component({
  selector: 'app-registration-complete',
  templateUrl: './registration-complete.component.html',
  styleUrls: ['./registration-complete.component.scss']
})
export class RegistrationCompleteComponent implements OnInit {
  registration: RegistrationModel[];

  constructor(private _registrationService: RegistrationService) { }

  ngOnInit() {
    this._registrationService.registration$.subscribe(registration => this.registration = registration);

    console.log(this.registration);
  }

}
