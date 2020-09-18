import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ParentGuard implements CanActivate {
  constructor(private establishmentService: EstablishmentService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const primaryWorkplace = this.establishmentService.primaryWorkplace;

    if (primaryWorkplace) {
      return this.check(primaryWorkplace.isParent);
    }

    const workplaceUid = this.establishmentService.establishmentId;
    if (workplaceUid) {
      return this.establishmentService.getEstablishment(workplaceUid).pipe(
        tap((workplace) => this.establishmentService.setPrimaryWorkplace(workplace)),
        map((workplace) => this.check(workplace.isParent)),
      );
    }

    this.router.navigate(['/logged-out']);
    return false;
  }

  private check(isParent) {
    if (!isParent) {
      this.router.navigate(['/dashboard']);
    }

    return isParent;
  }
}
