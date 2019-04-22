import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { WorkplaceLocation } from '@core/model/workplace-location.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterGuard implements CanActivate {
  private workplaceLocations: Array<WorkplaceLocation>;

  constructor(private registrationService: RegistrationService, private router: Router) {}

  canActivate() {
    this.registrationService.workplaceLocations$.subscribe(
      (workplaceLocations: Array<WorkplaceLocation>) => this.workplaceLocations = workplaceLocations
    );

    // check if registration process has started
    if (this.workplaceLocations) {
      return true;
    }

    this.router.navigate(['/registration/regulated-by-cqc']);
    return false;
  }
}
