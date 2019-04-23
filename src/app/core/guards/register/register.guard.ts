import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { LocationAddress } from '@core/model/location-address.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {
  private locationAddresses: Array<LocationAddress>;

  constructor(private registrationService: RegistrationService, private router: Router) {}

  canActivate() {
    this.registrationService.locationAddresses$.subscribe(
      (locationAddresses: Array<LocationAddress>) => this.locationAddresses = locationAddresses
    );

    // check if registration process has started
    if (this.locationAddresses) {
      return true;
    }

    this.router.navigate(['/registration/regulated-by-cqc']);
    return false;
  }
}
