import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterGuard implements CanActivate {
  private registrationInProgress: boolean;

  constructor(private registrationService: RegistrationService, private router: Router) {}

  canActivate() {
    this.registrationService.registrationInProgress$.subscribe(
      (registrationInProgress: boolean) => (this.registrationInProgress = registrationInProgress),
    );

    // check if registration process has started
    if (this.registrationInProgress) {
      return true;
    }

    this.router.navigate(['/registration/start']);
    return false;
  }
}
