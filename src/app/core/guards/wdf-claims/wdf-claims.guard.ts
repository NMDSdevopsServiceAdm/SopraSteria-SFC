import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { GrantLetterService } from '@core/services/wdf-claims/wdf-grant-letter.service';

@Injectable({
  providedIn: 'root',
})
export class WdfClaimsGuard implements CanActivate {
  private wdfClaimInProgress: boolean;

  constructor(private grantLetterService: GrantLetterService, private router: Router) {}

  canActivate(): boolean {
    this.grantLetterService.wdfClaimInProgress$.subscribe(
      (wdfClaimInProgress: boolean) => (this.wdfClaimInProgress = wdfClaimInProgress),
    );

    if (this.wdfClaimInProgress) {
      return true;
    }

    this.router.navigate(['/wdf-claims/grant-letter']);

    return false;
  }
}
