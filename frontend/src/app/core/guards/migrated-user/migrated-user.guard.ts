import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class MigratedUserGuard  {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkTermsAcceptance(state);
  }

  private checkTermsAcceptance(state: RouterStateSnapshot): boolean {
    if (this.userService.agreedUpdatedTerms) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
