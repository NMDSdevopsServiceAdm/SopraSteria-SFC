import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AcceptedTermsGuard implements CanActivateChild {
  constructor(private router: Router, private userService: UserService) {}

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkTermsAcceptance(state);
  }

  private checkTermsAcceptance(state: RouterStateSnapshot): boolean {
    if (!this.userService.agreedUpdatedTerms$.value) {
      this.router.navigate(['/migrated-user-terms-and-conditions']);
      return false;
    }
    return true;
  }
}
