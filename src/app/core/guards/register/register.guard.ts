import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { RegistrationModel } from '@core/model/registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {
  private registration: RegistrationModel;

  constructor(private registrationService: RegistrationService, private router: Router) {}

  canActivate() {
    this.registrationService.registration$.subscribe(
      (registration: RegistrationModel) => this.registration = registration
    );

    // check if registration process has started
    if (this.registration) {
      return true;
    }

    this.router.navigate(['/registration/regulated-by-cqc']);
    return false;
  }
}
