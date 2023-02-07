import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StandAloneAccountGuard implements CanActivate {
  constructor(private establishmentService: EstablishmentService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    console.log('**** stand alone account guard *****');
    const standAloneAccount = true;

    if (standAloneAccount) {
      this.router.navigate(['/new/dashboard']);
    } else {
      return true;
    }
  }
}
