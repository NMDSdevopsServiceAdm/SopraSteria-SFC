import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { WorkplaceService } from '@core/services/workplace.service';

@Injectable({
  providedIn: 'root',
})
export class AddWorkplaceInProgressGuard implements CanActivate {
  constructor(private router: Router, private workplaceService: WorkplaceService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.workplaceService.addWorkplaceInProgress$.value) {
      return true;
    } else {
      this.router.navigate(['/workplace/view-my-workplaces']);
      return false;
    }
  }
}
