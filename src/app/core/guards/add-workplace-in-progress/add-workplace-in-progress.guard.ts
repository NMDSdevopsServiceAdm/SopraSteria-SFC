import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { WorkplaceService } from '@core/services/workplace.service';

@Injectable({
  providedIn: 'root',
})
export class AddWorkplaceInProgressGuard implements CanActivateChild {
  constructor(private router: Router, private workplaceService: WorkplaceService) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.workplaceService.addWorkplaceInProgress$.value) {
      return true;
    } else {
      this.router.navigate(['/workplace/view-my-workplaces']);
      return false;
    }
  }
}
