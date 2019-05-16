import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { RegistrationModel } from '../../../core/model/registration.model';
import { RegistrationService } from '../../services/registration.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterGuard implements CanActivate {
  registration: RegistrationModel;

  constructor(private _registrationService: RegistrationService, private router: Router) {}

  canActivate() {
    this._registrationService.registration$.subscribe(registration => (this.registration = registration));

    if (this.registration.locationdata[0].isRegulated !== null) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
